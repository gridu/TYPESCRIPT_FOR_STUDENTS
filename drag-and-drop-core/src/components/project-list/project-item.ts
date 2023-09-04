import { UIComponent } from "../base";
import { Project } from "../../models";
import { Autobinder } from "../../decorators";
import { Dragable } from "../../interfaces/drag-drop";


export class ProjectItemComponent extends UIComponent<HTMLUListElement, HTMLLIElement> implements Dragable {
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
