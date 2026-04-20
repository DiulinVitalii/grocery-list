import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

export function trimmedRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isEmpty =
      value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
    return isEmpty ? { required: true } : null;
  };
}
