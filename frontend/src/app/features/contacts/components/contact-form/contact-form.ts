import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage, apiValidationErrors } from '../../../../core/api-error';
import { Contact, ContactPayload, ContactType, contactTypeOptions } from '../../../../core/models/contact.model';
import { ValidationErrors } from '../../../../core/models/api.model';
import { ContactService } from '../../../../core/services/contact';
import { formatPhone } from '../../../../shared/formatters/brazilian.formatters';
import { mobilePhoneValidator } from '../../../../shared/validators/brazilian.validators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  selector: 'app-contact-form',
  styleUrl: './contact-form.scss',
  templateUrl: './contact-form.html',
})
export class ContactForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);

  readonly personId = input.required<number>();
  readonly contact = input<Contact | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly options = contactTypeOptions;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');
  protected readonly serverErrors = signal<ValidationErrors>({});
  protected readonly form = this.formBuilder.nonNullable.group({
    type: 'email' as ContactType,
    value: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    effect(() => {
      const contact = this.contact();
      this.form.reset({ type: contact?.type ?? 'email', value: contact?.value ?? '' });
      this.submitted.set(false);
      this.error.set('');
      this.serverErrors.set({});
      this.applyValueValidators(contact?.type ?? 'email');
    });

    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => this.applyValueValidators(type));

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.error.set('');
      this.serverErrors.set({});
    });
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

    const payload: ContactPayload = this.form.getRawValue();
    const contact = this.contact();
    const request = contact
      ? this.contactService.update(contact.id, payload)
      : this.contactService.create(this.personId(), payload);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.saved.emit(),
      error: (error: unknown) => {
        this.error.set(apiErrorMessage(error));
        this.serverErrors.set(apiValidationErrors(error));
      },
    });
  }

  protected valueError(): string {
    const backendError = this.serverErrors()['value']?.[0];

    if (backendError) {
      return backendError;
    }

    const control = this.form.controls.value;

    if (!this.submitted() || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Informe o contato.';
    }

    return this.form.controls.type.value === 'email'
      ? 'Informe um e-mail válido.'
      : 'Informe um celular brasileiro válido.';
  }

  protected formatValue(): void {
    if (this.form.controls.type.value !== 'email') {
      this.form.controls.value.setValue(formatPhone(this.form.controls.value.value));
    }
  }

  private applyValueValidators(type: ContactType): void {
    const validators =
      type === 'email' ? [Validators.required, Validators.email] : [Validators.required, mobilePhoneValidator];
    this.form.controls.value.setValidators(validators);
    this.form.controls.value.updateValueAndValidity();
  }
}
