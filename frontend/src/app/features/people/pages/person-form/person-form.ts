import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, finalize, map, switchMap, tap, timer } from 'rxjs';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api-error';
import { ValidationErrors } from '../../../../core/models/api.model';
import { AddressLookup, PersonPayload } from '../../../../core/models/person.model';
import { PersonService } from '../../../../core/services/person';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { formatCep, formatCpf, formatPhone } from '../../../../shared/formatters/brazilian.formatters';
import { cpfValidator, mobilePhoneValidator } from '../../../../shared/validators/brazilian.validators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingState, ReactiveFormsModule, RouterLink],
  selector: 'app-person-form',
  styleUrl: './person-form.scss',
  templateUrl: './person-form.html',
})
export class PersonForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly personService = inject(PersonService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly personId = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected readonly isEditing = this.personId !== null;
  protected readonly loading = signal(this.isEditing);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');
  protected readonly serverErrors = signal<ValidationErrors>({});
  protected readonly addressPreview = signal<AddressLookup | null>(null);
  protected readonly cepLoading = signal(false);
  protected readonly cepError = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    cpf: ['', [Validators.required, cpfValidator]],
    phone: ['', [Validators.required, mobilePhoneValidator]],
    address: this.formBuilder.nonNullable.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      number: ['', [Validators.required, Validators.maxLength(20)]],
      complement: ['', [Validators.maxLength(255)]],
    }),
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.error.set('');
      this.serverErrors.set({});
    });
    this.watchCep();

    if (this.personId) {
      this.loadPerson(this.personId);
    }
  }

  protected submit(): void {
    if (this.saving()) {
      return;
    }

    this.submitted.set(true);
    this.error.set('');
    this.serverErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cep = this.digits(this.form.controls.address.controls.cep.value);

    if (this.cepLoading() || this.addressPreview()?.cep !== cep) {
      this.cepError.set(
        this.cepLoading() ? 'Aguarde a consulta do CEP.' : 'Consulte um CEP válido antes de continuar.',
      );

      return;
    }

    const values = this.form.getRawValue();
    const payload: PersonPayload = {
      name: values.name.trim(),
      cpf: values.cpf,
      phone: values.phone,
      address: {
        cep: values.address.cep,
        number: values.address.number.trim(),
        complement: values.address.complement.trim() || null,
      },
    };
    const request = this.personId
      ? this.personService.update(this.personId, payload)
      : this.personService.create(payload);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => void this.router.navigate(this.isEditing ? ['/people', response.data.id] : ['/people']),
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.serverErrors.set(apiValidationErrors(error));
      },
    });
  }

  protected fieldError(path: string): string {
    const backendError = this.serverErrors()[path]?.[0];

    if (backendError) {
      return backendError;
    }

    const control = this.form.get(path);

    if (!control || !this.submitted() || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (control.hasError('maxlength')) {
      return 'O valor informado é muito longo.';
    }

    if (control.hasError('cpf')) {
      return 'Informe um CPF válido.';
    }

    if (control.hasError('mobilePhone')) {
      return 'Informe um celular brasileiro válido.';
    }

    return 'Confira o formato informado.';
  }

  protected formatCpf(): void {
    this.form.controls.cpf.setValue(formatCpf(this.form.controls.cpf.value));
  }

  protected formatPhone(): void {
    this.form.controls.phone.setValue(formatPhone(this.form.controls.phone.value));
  }

  protected formatCep(): void {
    const cepControl = this.form.controls.address.controls.cep;
    cepControl.setValue(formatCep(cepControl.value));
  }

  private loadPerson(id: number): void {
    this.personService
      .get(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.form.setValue(
            {
              name: data.name,
              cpf: formatCpf(data.cpf),
              phone: formatPhone(data.phone),
              address: {
                cep: formatCep(data.address.cep),
                number: data.address.number,
                complement: data.address.complement ?? '',
              },
            },
            { emitEvent: false },
          );
          this.addressPreview.set({
            cep: data.address.cep,
            street: data.address.street,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
          });
        },
        error: (error: unknown) => this.error.set(apiErrorMessage(error)),
      });
  }

  private watchCep(): void {
    const cepControl = this.form.controls.address.controls.cep;

    cepControl.valueChanges
      .pipe(
        map((value) => this.digits(value)),
        distinctUntilChanged(),
        tap((cep) => {
          this.addressPreview.set(null);
          this.cepError.set('');
          this.cepLoading.set(cep.length === 8);
        }),
        switchMap((cep) => {
          if (cep.length !== 8) {
            return EMPTY;
          }

          return timer(350).pipe(
            switchMap(() => this.personService.lookupCep(cep)),
            catchError((error: unknown) => {
              const validationMessage = apiValidationErrors(error)['cep']?.[0];
              this.cepError.set(validationMessage ?? apiErrorMessage(error));

              return EMPTY;
            }),
            finalize(() => {
              if (this.digits(cepControl.value) === cep) {
                this.cepLoading.set(false);
              }
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ data }) => this.addressPreview.set(data));
  }

  private digits(value: string): string {
    return value.replace(/\D/g, '');
  }
}
