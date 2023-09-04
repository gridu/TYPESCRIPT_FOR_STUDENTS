export abstract class UIComponent<R extends HTMLElement, C extends HTMLElement> {
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
