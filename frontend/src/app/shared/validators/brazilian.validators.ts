import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { onlyDigits } from '../formatters/brazilian.formatters';

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const cpf = onlyDigits(control.value);

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
  let phone = onlyDigits(control.value);
  phone = phone.length === 11 ? `55${phone}` : phone;

  return /^55[1-9][0-9]9[0-9]{8}$/.test(phone) ? null : { mobilePhone: true };
};
