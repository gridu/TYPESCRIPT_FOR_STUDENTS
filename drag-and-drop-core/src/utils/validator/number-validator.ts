export class NumberValidator implements Validatable {
    constructor(
        public label: string,
        private value: number,
        private min: number,
        private max: number
    ) { }

    validate() {
        if (this.value < this.min) {
            throw Error(
                `[${this.label}] Actual value is ${this.value}. `
                + `Has to be greater or equal than ${this.min}!`
            )
        }

        if (this.value > this.max) {
            throw Error(
                `[${this.label}] Actual value is ${this.value}. `
                + `Has to be lower or equal than ${this.max}!`
            )
        }
    }
}
