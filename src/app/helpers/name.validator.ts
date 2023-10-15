import { UntypedFormGroup } from '@angular/forms';

// reg expression for matching names
const regName = /^[a-zA-Z]+$/;

// custom validator to check that two fields match
export function ValidatePersonName(name_control_name: string) {
    return (formGroup: UntypedFormGroup) => {
        const person_name = formGroup.controls[name_control_name];

        // return if another validator has already found an error on the name
        if (person_name.errors && !person_name.errors.invalidInput) { return; }

        // set error on matchingControl if validation fails
        if (!regName.test(person_name.value)) {
            person_name.setErrors({ invalidInput : true });
        } else {
            person_name.setErrors(null);
        }
    };
}
