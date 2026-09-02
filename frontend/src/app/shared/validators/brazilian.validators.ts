import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const cpf = digits(control.value);

  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return { cpf: true };
  }

  for (let position = 9; position < 11; position += 1) {
    let sum = 0;

    for (let index = 0; index < position; index += 1) {
      sum += Number(cpf[index]) * (position + 1 - index);
    }

    const digit = ((sum * 10) % 11) % 10;

    if (digit !== Number(cpf[position])) {
      return { cpf: true };
    }
  }

  return null;
};

export const mobilePhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  let phone = digits(control.value);
  phone = phone.length === 11 ? `55${phone}` : phone;

  return /^55[1-9][0-9]9[0-9]{8}$/.test(phone) ? null : { mobilePhone: true };
};
