import { StatefulProjectListComponent } from "./base";
import { Autobinder } from "../../decorators";
import { modifiedProjectStateObservableEvent } from "../../utils";
import { Project } from "../../models";
import { ProjectState } from "../../state";


export class FinishedProjectListComponent extends StatefulProjectListComponent {
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
