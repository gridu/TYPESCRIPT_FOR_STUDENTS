import { ProjectInputComponent } from "./components/project-input";
import {
    ActiveProjectListComponent,
    FinishedProjectListComponent
} from "./components/project-list";


new ProjectInputComponent().render();
new ActiveProjectListComponent().render();
new FinishedProjectListComponent().render();
