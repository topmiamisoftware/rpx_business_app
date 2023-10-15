
  import { UntypedFormGroup } from '@angular/forms';

  // allow letters, numbers, and underscores
  const illegalChars = /\W/;

  // custom validator to check that two fields match
  export function ValidatePassword(password_control_name: string) {
    return (formGroup: UntypedFormGroup) => {
        const password = formGroup.controls[password_control_name];

        // return if another validator has already found an error on the username
        if (password.errors &&
            (!password.errors.oneNumber &&
            !password.errors.oneLowerCase &&
            !password.errors.oneUpperCase)
        ) { return; }

        if ((password.value.length < 8) || (password.value.length > 135)) {
            password.setErrors({ wrongLength: true });
        }

        let re = /[0-9]/;
        if (!re.test(password.value)) {
            password.setErrors({ oneNumber: true });
            // Password must contain at least one number (0-9)!
        }

        re = /[a-z]/;
        if (!re.test(password.value)) {
            password.setErrors({ oneLowerCase: true });
            // Password must contain at least one lowercase letter (a-z)!
        }

        re = /[A-Z]/;
        if (!re.test(password.value)) {
            password.setErrors({ oneLowerCase: true });
            // Password must contain at least one uppercase letter (A-Z)!
        }
    };
}
