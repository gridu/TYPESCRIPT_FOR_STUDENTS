export class StringValidator implements Validatable {
    constructor(
        public label: string,
        private value: string,
        private minLength: number,
        private maxLength: number
    ) { }

    validate() {
        if (this.value.length < this.minLength) {
            throw Error(
                `[${this.label}] Actual length of ${this.value} is ${this.value.length}. `
                + `Has to be greater or equal than ${this.minLength}!`
            )
        }

        if (this.value.length > this.maxLength) {
            throw Error(
                `[${this.label}] Actual length of ${this.value} is ${this.value.length}. `
                + `Has to be lower or equal than ${this.maxLength}!`
            )
        }
    }
}
