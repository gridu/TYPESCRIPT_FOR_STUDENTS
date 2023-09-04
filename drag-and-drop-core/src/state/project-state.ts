import { State } from "./base";
import { Project, ProjectStatus } from "../models";
import { modifiedProjectStateObservableEvent } from "../utils";
import { ObservableEvent } from "../decorators/observable";


export class ProjectState extends State<Project> {
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
