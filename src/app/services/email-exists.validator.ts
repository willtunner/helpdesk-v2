import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { debounceTime, map, switchMap, of } from 'rxjs';
import { EmailValidationService } from './email-validation.service';

export function emailExistsValidator(
  emailService: EmailValidationService,
  collections: string[]
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(400),
      switchMap(email =>
        emailService.checkEmailExistsInCollections(email, collections).then(exists => {
          return exists ? { emailExists: true } : null;
        })
      )
    );
  };
}
