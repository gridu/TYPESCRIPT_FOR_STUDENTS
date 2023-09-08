import { UIComponent } from "./base";
import { Autobinder } from "../decorators";
import { ProjectService } from "../services";


export class ProjectInputComponent extends UIComponent<HTMLDivElement, HTMLFormElement> {
    private titleInputEl: HTMLInputElement;
    private descriptionInputEl: HTMLInputElement;
    private peopleInputEl: HTMLInputElement;

    constructor() {
        super('app', 'project-input', 'top');
        this.titleInputEl = this.htmlElement.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputEl = this.htmlElement.querySelector('#description')! as HTMLInputElement;
        this.peopleInputEl = this.htmlElement.querySelector('#people')! as HTMLInputElement;   
    }

    configure(): void {
        this.htmlElement.addEventListener('submit', this._submitHandler.bind(this));
    }

    buildHTMLElement(): HTMLFormElement {
        const inputFormEl = super.buildHTMLElement();
        inputFormEl.id = 'user-input';
        return inputFormEl;
    }

    @Autobinder
    private async _submitHandler(event: Event) {
        event.preventDefault();
        const [title, description, people] = this._getUserInput();
        try {
            await ProjectService.create(title, description, people);
            this._clearForm();
        } catch(error) {
            alert(error);
        }
    }

    private _getUserInput(): [string, string, number] {
        const enteredTitle = this.titleInputEl.value;
        const enteredDescription = this.descriptionInputEl.value;
        const enteredPeople = +this.peopleInputEl.value;
        return [enteredTitle, enteredDescription, enteredPeople];
    }

    private _clearForm(): void {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }
}
