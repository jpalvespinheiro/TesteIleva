import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, finalize, map, switchMap, tap, timer } from 'rxjs';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api-error';
import { ValidationErrors } from '../../../../core/models/api.model';
import { AddressLookup, PersonPayload } from '../../../../core/models/person.model';
import { PersonService } from '../../../../core/services/person';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { formatCep, formatCpf, formatPhone, onlyDigits } from '../../../../shared/formatters/brazilian.formatters';
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

  private readonly idParam = this.route.snapshot.paramMap.get('id');

  protected readonly personId = this.idParam === null ? null : Number(this.idParam);
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
    this.clearServerErrorOnChange('name', this.form.controls.name);
    this.clearServerErrorOnChange('cpf', this.form.controls.cpf);
    this.clearServerErrorOnChange('phone', this.form.controls.phone);
    this.clearServerErrorOnChange('address.cep', this.form.controls.address.controls.cep);
    this.clearServerErrorOnChange('address.number', this.form.controls.address.controls.number);
    this.clearServerErrorOnChange('address.complement', this.form.controls.address.controls.complement);
    this.watchCep();

    if (this.personId === null) {
      return;
    }

    if (!Number.isInteger(this.personId) || this.personId <= 0) {
      void this.router.navigate(['/people']);

      return;
    }

    this.loadPerson(this.personId);
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

    const cep = onlyDigits(this.form.controls.address.controls.cep.value);

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
        const validationErrors = apiValidationErrors(error);
        this.serverErrors.set(validationErrors);
        this.error.set(Object.keys(validationErrors).length === 0 ? apiErrorMessage(error) : '');
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
        map((value) => onlyDigits(value)),
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
              if (onlyDigits(cepControl.value) === cep) {
                this.cepLoading.set(false);
              }
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ data }) => this.addressPreview.set(data));
  }

  private clearServerErrorOnChange(path: string, control: AbstractControl): void {
    control.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.error.set('');
      const errors = { ...this.serverErrors() };

      if (!Object.hasOwn(errors, path)) {
        return;
      }

      delete errors[path];
      this.serverErrors.set(errors);
    });
  }
}
