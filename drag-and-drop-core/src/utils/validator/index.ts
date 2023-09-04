import { NumberValidator } from "./number-validator";
import { StringValidator } from "./string-validator";


function validate(validators: Validatable[]): void {
    for (const validator of validators) {
        validator.validate();
    }
}

export {
    StringValidator,
    NumberValidator,
    validate,
}
