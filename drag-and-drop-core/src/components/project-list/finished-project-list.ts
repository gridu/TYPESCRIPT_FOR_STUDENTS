import { StatefulProjectListComponent } from "./base";
import { Autobinder } from "../../decorators";
import { modifiedProjectStateObservableEvent } from "../../utils";
import { Project } from "../../models";
import { ProjectService } from "../../services";


export class FinishedProjectListComponent extends StatefulProjectListComponent {
    get type(): string {
        return 'finished';
    }

    protected configure(): void {
        super.configure();
        modifiedProjectStateObservableEvent.addEventListener(
            (_: Project) => {
                this.projectListEl.textContent = '';
                ProjectService.finishedProjects.map(
                    (project: Project) => this._addProject(project)
                );
            }
        );
    }

    @Autobinder
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text');
        const project = ProjectService.getById(projectId);
        new ProjectService(project).finish();
        console.log('Drop the project: ', project);
    }
}
