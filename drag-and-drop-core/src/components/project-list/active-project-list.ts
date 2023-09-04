import { StatefulProjectListComponent } from "./base";
import { Autobinder } from "../../decorators";
import { modifiedProjectStateObservableEvent } from "../../utils";
import { ProjectState } from "../../state";
import { Project } from "../../models";


export class ActiveProjectListComponent extends StatefulProjectListComponent {
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
