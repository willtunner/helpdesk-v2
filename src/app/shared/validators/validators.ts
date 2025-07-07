import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').replace(/\D/g, '');

    if (!value || value.length !== 11) return { cpf: true };

    const invalidCpfs = [
      '00000000000', '11111111111', '22222222222',
      '33333333333', '44444444444', '55555555555',
      '66666666666', '77777777777', '88888888888',
      '99999999999'
    ];

    if (invalidCpfs.includes(value)) return { cpf: true };

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(value.charAt(i)) * (10 - i);
    let check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    if (check !== Number(value.charAt(9))) return { cpf: true };

    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(value.charAt(i)) * (11 - i);
    check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    if (check !== Number(value.charAt(10))) return { cpf: true };

    return null;
  };
}

export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').replace(/\D/g, '');

    if (!value || value.length !== 14) return { cnpj: true };

    const invalidCnpjs = [
      '00000000000000', '11111111111111', '22222222222222',
      '33333333333333', '44444444444444', '55555555555555',
      '66666666666666', '77777777777777', '88888888888888',
      '99999999999999'
    ];

    if (invalidCnpjs.includes(value)) return { cnpj: true };

    let size = 12;
    let numbers = value.substring(0, size);
    const digits = value.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(0))) return { cnpj: true };

    size = 13;
    numbers = value.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(1))) return { cnpj: true };

    return null;
  };
}
