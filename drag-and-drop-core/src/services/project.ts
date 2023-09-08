import { validate } from 'class-validator';

import { Project, ProjectStatus } from "../models";
import { ProjectState } from '../state';
import { ObservableEvent } from '../decorators/observable';
import { modifiedProjectStateObservableEvent } from '../utils';


export class ProjectService {
    constructor(public project: Project) {}

    static get activeProjects() {
        const projectState = ProjectState.getInstance();
        return projectState.projects.filter(
            (project: Project) => project.status == ProjectStatus.ACTIVE
        );
    }

    static get finishedProjects() {
        const projectState = ProjectState.getInstance();
        return projectState.projects.filter(
            (project: Project) => project.status == ProjectStatus.FINISHED
        );
    }

    static getById(projectId: string): Project {
        const projectState = ProjectState.getInstance();
        const project = projectState.projects.find(
            (project) => project.id == projectId
        );
        if (!project) {
            throw Error(`Can not find the project with ID=${projectId}`);
        }
        return project
    }

    static async create(
        title: string,
        description: string,
        people: number
    ): Promise<Project> {
        const newProject = new Project(title, description, people, ProjectStatus.ACTIVE);
        let errorMessage: string = '\n';
        const errors = await validate(newProject);
        if (errors.length > 0) {
            for (const error of errors) {
                if (error.constraints) {
                    for (const value of Object.values(error.constraints!)) {
                        errorMessage += `❌ ${value}\n`;
                    }
                }

            }
            throw Error(errorMessage);
        }
    
        const projectState = ProjectState.getInstance();
        projectState.addItem(newProject);
        modifiedProjectStateObservableEvent.triggerEvent(newProject);
        return newProject;
    }

    @ObservableEvent([modifiedProjectStateObservableEvent])
    reopen() : Project {
        this.project.status = ProjectStatus.ACTIVE;
        return this.project;
    }

    @ObservableEvent([modifiedProjectStateObservableEvent])
    finish() : Project {
        this.project.status = ProjectStatus.FINISHED;
        return this.project;
    }
}
