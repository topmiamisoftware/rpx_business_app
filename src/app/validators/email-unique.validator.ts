import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { retryWithBackOff } from 'src/app/helpers/retry.operators';
import { EmailConfirmationService } from '../spotbie/email-confirmation/email-confirmation.service';

export class ValidateUniqueEmail {

    static valid(checkEmailUniqueService: EmailConfirmationService, userEmail: string) {
        return (control: AbstractControl) => {
          return checkEmailUniqueService.checkIfEmailUnique(control.value).pipe(
          retryWithBackOff(1000),
          map(res => {
            if(res === undefined || res === null) return null
            if(userEmail === control.value || res.is_valid) {
              return null 
            } else { 
              return { emailTaken: true }
            }        
          }))
        
        }
    }
    
}