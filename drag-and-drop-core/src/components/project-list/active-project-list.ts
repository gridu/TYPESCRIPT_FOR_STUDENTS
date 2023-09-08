import { StatefulProjectListComponent } from "./base";
import { Autobinder } from "../../decorators";
import { modifiedProjectStateObservableEvent } from "../../utils";
import { Project } from "../../models";
import { ProjectService } from "../../services";


export class ActiveProjectListComponent extends StatefulProjectListComponent {
    get type(): string {
        return 'active';
    }

    protected configure(): void {
        super.configure();
        modifiedProjectStateObservableEvent.addEventListener(
            (_: Project) => {
                this.projectListEl.textContent = '';
                ProjectService.activeProjects.map(
                    (project: Project) => this._addProject(project)
                );
            }
        );
    }

    @Autobinder
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text');
        const project = ProjectService.getById(projectId);
        new ProjectService(project).reopen();
        console.log('Reopened the project: ', project);
    }
}
