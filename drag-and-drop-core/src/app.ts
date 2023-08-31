type EvListener<T> = (item: T) => void;

class Observable<T> {
    constructor(
        private eventListeners: EvListener<T>[] = []
    ) { }

    addEventListener(newEventListener: EvListener<T>) {
        this.eventListeners.push(newEventListener);
    }

    triggerEvent(item: T) {
        for (const listener of this.eventListeners) {
            listener(item);
        }
    }
}
const modifiedProjectStateObservableEvent = new Observable<Project>();


function Autobinder(_: any, _1: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor: PropertyDescriptor = {
        configurable: descriptor.configurable,
        get() {
            const newMethod = originalMethod.bind(this);
            return newMethod;
        }
    }
    return newDescriptor;
}

function ObservableEvent<T>(observables: Observable<T>[]) {
    function decorator(_: any, _1: string, descriptor: PropertyDescriptor) {
        const newDescriptor: PropertyDescriptor = {
            configurable: descriptor.configurable,
            get() {
                return (...args: any[]) => {
                    let originalMethod;
                    if (descriptor.value) {
                        originalMethod = descriptor.value.bind(this);
                    } else {
                        originalMethod = descriptor.get?.apply(this, []);
                    }
                    const originalResponse = originalMethod(...args) as T;
                    observables.forEach((ob: Observable<T>) => ob.triggerEvent(originalResponse));
                    return originalResponse;
                }
            }
        }
        return newDescriptor;
    }
    return decorator;
}


interface Dragable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}


interface Validatable {
    label: string
    validate: () => void
}

class StringValidator implements Validatable {
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

class NumberValidator implements Validatable {
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

function validate(validators: Validatable[]): void {
    for (const validator of validators) {
        validator.validate();
    }
}


enum ProjectStatus {
    ACTIVE,
    FINISHED,
}

class Project {
    id: string

    constructor(
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus,
    ) {
        this.id = Math.random().toString()
    }
}

type ProjectEventHandler = (targetProject: Project) => void;


class State<T> {
    constructor(
        protected items: T[] = [],
    ) {}

    @ObservableEvent([modifiedProjectStateObservableEvent])
    addItem(item: T): T {
        this.items.push(item);
        return item;
    }
}

class ProjectState extends State<Project> {
    static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ProjectState();
        }
        return this.instance;
    }

    get activeProjects() {
        return this.items.filter(
            (project: Project) => project.status == ProjectStatus.ACTIVE
        );
    }

    get finishedProjects() {
        return this.items.filter(
            (project: Project) => project.status == ProjectStatus.FINISHED
        );
    }

    getProjectById(id: string): Project {
        const project = this.items.find(
            (item: Project) => item.id === id
        );
        if (!project) {
            throw Error(`There is no project with ID=${id}`);
        }
        return project;
    }

    @ObservableEvent([modifiedProjectStateObservableEvent])
    finishProject(id: string): Project {
        const project = this.getProjectById(id);
        if (project.status === ProjectStatus.FINISHED) {
            throw Error(`Project with ID=${id} has been already finished.`);
        }
        project.status = ProjectStatus.FINISHED;
        return project;
    }

    @ObservableEvent([modifiedProjectStateObservableEvent])
    reopenProject(id: string): Project {
        const project = this.getProjectById(id);
        if (project.status === ProjectStatus.ACTIVE) {
            throw Error(`Project with ID=${id} has been already opened`);
        }
        project.status = ProjectStatus.ACTIVE;
        return project;
    }
}


abstract class UIComponent<R extends HTMLElement, C extends HTMLElement> {
    /**
     * R - type of the root container element
     * C - type of the component element
     */
    protected htmlRootContainer: R
    protected htmlElement: C;
    protected htmlTemplate: HTMLTemplateElement;

    constructor(rootId: string, templateId: string, private position: 'top' | 'bottom') {
        this.htmlTemplate = document.getElementById(templateId)! as HTMLTemplateElement;
        this.htmlRootContainer = document.getElementById(rootId)! as R;
        this.htmlElement = this.buildHTMLElement();
    }

    render(): void {
        this.configure();
        this.htmlRootContainer.insertAdjacentElement(
            this.position == 'bottom' ? 'beforeend' : 'afterbegin',
            this.htmlElement
        );
    }

    protected abstract configure(): void;    

    protected buildHTMLElement(): C {
        const templateContent = document.importNode(this.htmlTemplate.content, true);
        const element = templateContent.firstElementChild as C;
        return element;
    }
}


class ProjectItemComponent extends UIComponent<HTMLUListElement, HTMLLIElement> implements Dragable {
    constructor(rootId: string, private project: Project) {
        super(rootId, 'single-project', 'bottom');
    }

    get personsText() {
        if (this.project.people == 1) {
            return '1 person';
        }
        return `${this.project.people} persons`;
    }
    
    protected configure(): void {
        this.htmlElement.id = this.project.id;
        this.htmlElement.querySelector('h2')!.textContent = this.project.title;
        this.htmlElement.querySelector('h3')!.textContent = this.personsText + ' assigned';
        this.htmlElement.querySelector('p')!.textContent = this.project.description;

        this.htmlElement.addEventListener('dragstart', this.dragStartHandler);
        this.htmlElement.addEventListener('dragend', this.dragEndHandler);
    }

    @Autobinder
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    @Autobinder
    dragEndHandler(event: DragEvent): void {
        console.log("drag end");
    }
}


abstract class ProjectListComponent extends UIComponent<HTMLDivElement, HTMLElement> implements DragTarget {
    protected projectListEl: HTMLUListElement;

    constructor() {
        super('app', 'project-list', 'bottom');
        this.projectListEl = this.htmlElement.querySelector('ul')! as HTMLUListElement;
    }

    protected configure(): void {
        this.htmlElement.addEventListener('dragover', this.dragOverHandler);
        this.htmlElement.addEventListener('dragleave', this.dragLeaveHandler);
        this.htmlElement.addEventListener('drop', this.dropHandler);
    }

    protected _addProject(project: Project) {
        const projectItem = new ProjectItemComponent(this.projectListEl.id, project);
        projectItem.render();
    }

    @Autobinder
    public dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            this.projectListEl.classList.add('droppable');
        }
    }

    @Autobinder
    public dragLeaveHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            this.projectListEl.classList.remove('droppable');
        }
    }

    abstract dropHandler(event: DragEvent): void;
}

abstract class StatefulProjectListComponent extends ProjectListComponent {
    abstract get type(): string;

    protected configure(): void {
        super.configure();
        this.htmlElement.id = `${this.type}-projects`;
        this.projectListEl.id = `${this.type}-projects-list`;
        const projectsHeaderEl = this.htmlElement.querySelector('h2')! as HTMLHeadElement;
        projectsHeaderEl.textContent = this.type.toUpperCase() + ' PROJECTS'
    }
}

class ActiveProjectListComponent extends StatefulProjectListComponent {
    get type(): string {
        return 'active';
    }

    protected configure(): void {
        super.configure();
        modifiedProjectStateObservableEvent.addEventListener(
            (_: Project) => {
                this.projectListEl.textContent = '';
                const projectState = ProjectState.getInstance();
                projectState.activeProjects.map(
                    (project: Project) => this._addProject(project)
                );
            }
        );
    }

    @Autobinder
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text');
        const projectState = ProjectState.getInstance();
        const project = projectState.getProjectById(projectId);
        
        projectState.reopenProject(project.id);
        console.log('Reopened the project: ', project);
    }
}

class FinishedProjectListComponent extends StatefulProjectListComponent {
    get type(): string {
        return 'finished';
    }

    protected configure(): void {
        super.configure();
        modifiedProjectStateObservableEvent.addEventListener(
            (_: Project) => {
                this.projectListEl.textContent = '';
                const projectState = ProjectState.getInstance();
                projectState.finishedProjects.map(
                    (project: Project) => this._addProject(project)
                );
            }
        );
    }

    @Autobinder
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text');
        const projectState = ProjectState.getInstance();
        const project = projectState.getProjectById(projectId);

        projectState.finishProject(project.id);
        console.log('Drop the project: ', project);
    }
}


class ProjectInputComponent extends UIComponent<HTMLDivElement, HTMLFormElement> {
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


const prjInput = new ProjectInputComponent().render();
const activeProjectList = new ActiveProjectListComponent().render();
const finishedProjectList = new FinishedProjectListComponent().render();
