import { FormControl } from '@angular/forms';
import { cpfValidator, mobilePhoneValidator } from './brazilian.validators';

describe('Brazilian validators', () => {
  it('accepts a valid CPF', () => {
    expect(cpfValidator(new FormControl('529.982.247-25'))).toBeNull();
  });

  it('rejects an invalid CPF', () => {
    expect(cpfValidator(new FormControl('111.111.111-11'))).toEqual({ cpf: true });
  });

  it('accepts a valid Brazilian mobile phone', () => {
    expect(mobilePhoneValidator(new FormControl('(11) 99999-8888'))).toBeNull();
  });

  it('rejects a landline', () => {
    expect(mobilePhoneValidator(new FormControl('(11) 3333-4444'))).toEqual({ mobilePhone: true });
  });
});
