import { UIComponent } from "./base";
import { Autobinder } from "../decorators";
import { Project, ProjectStatus } from "../models";
import { NumberValidator, StringValidator, validate } from "../utils/validator";
import { ProjectState } from "../state";


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
        this._setupEvents(this.htmlElement);
    }

    buildHTMLElement(): HTMLFormElement {
        const inputFormEl = super.buildHTMLElement();
        inputFormEl.id = 'user-input';
        return inputFormEl;
    }

    private _setupEvents(element: HTMLFormElement) {
        element.addEventListener('submit', this._submitHandler.bind(this));
    }

    @Autobinder
    private _submitHandler(event: Event) {
        event.preventDefault();
        let title: string, description: string, people: number;
        try {
            [title, description, people] = this._getUserInput();
        } catch (error) {
            alert(error);
            return;
        }

        const newProject = new Project(title, description, people, ProjectStatus.ACTIVE);
        const projectState = ProjectState.getInstance();
        projectState.addItem(newProject);
        this._clearForm();
    }

    private _getUserInput(): [string, string, number] {
        const enteredTitle = this.titleInputEl.value;
        const enteredDescription = this.descriptionInputEl.value;
        const enteredPeople = +this.peopleInputEl.value;

        const validators = [
            new StringValidator('Invalid title', enteredTitle, 1, 10),
            new StringValidator('Invalid description', enteredDescription, 5, 100),
            new NumberValidator('Invalid people', enteredPeople, 1, 10),
        ]
        validate(validators);
        return [enteredTitle, enteredDescription, enteredPeople];
    }

    private _clearForm(): void {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }
}
