import { Observable } from "./observable";
import { Project } from "../models";


export const modifiedProjectStateObservableEvent = new Observable<Project>();
