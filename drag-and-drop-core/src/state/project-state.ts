import { State } from "./base";
import { Project } from "../models";


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

    get projects() {
        return this.items;
    }
}
