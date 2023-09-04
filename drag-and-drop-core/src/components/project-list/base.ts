import { UIComponent } from "../base";
import { ProjectItemComponent } from "./project-item";
import { DragTarget } from "../../interfaces/drag-drop";
import { Project } from "../../models";
import { Autobinder } from "../../decorators";


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


export abstract class StatefulProjectListComponent extends ProjectListComponent {
    abstract get type(): string;

    protected configure(): void {
        super.configure();
        this.htmlElement.id = `${this.type}-projects`;
        this.projectListEl.id = `${this.type}-projects-list`;
        const projectsHeaderEl = this.htmlElement.querySelector('h2')! as HTMLHeadElement;
        projectsHeaderEl.textContent = this.type.toUpperCase() + ' PROJECTS'
    }
}
