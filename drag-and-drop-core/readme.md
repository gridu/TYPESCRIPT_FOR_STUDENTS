# Pet project based on Typescript that implements Drag&Drop functionality

![demo](./doc/dragndrop-demo.gif)

## How to run

1. Install [node.js](download) in your OS (should be v20.5.1)
1. Install project's dependencies with the following command:
    ```shell
    npm install
    ```
1. Run webpack development server:
    ```shell
    npm run start
    ```
1. Open the following URL in your web browser: `localhost:8080`

Run the following command to build production verstion:
    
```shell
npm run build
```


## Activity Diagram

```mermaid
---
title: New project creation
---
flowchart LR
    submit>'ADD PROJECT' button is clicked]
    
    read_data(Read input data)
    submit-->read_data

    validation{If input data is valid?}
    read_data-->validation

    alert(Print validation error)
    project_creation(Create new active project)
    validation-- No -->alert
    validation-->project_creation

    end_point1((( )))
    project_creation --> end_point1

    end_point2((( )))
    alert --> end_point2
```

```mermaid
---
title: Finish an active project
---
flowchart LR
    drag>Active project is dragged to the 'Finish' section]
    finish(Finish the dragged project)
    drag --> finish
    end_point((( )))
    finish --> end_point
```

```mermaid
---
title: Reopen a finished project
---
flowchart LR
    drag>Finished project is dragged to the 'Active' section]
    reopen(Activate the dragged project)
    drag --> reopen
    end_point((( )))
    reopen --> end_point
```

## Class Diagram

```mermaid
classDiagram
StringValidator ..|> Validatable
NumberValidator ..|> Validatable
class Validatable {
    <<interface>>
    label : string
    validate() : void
}

class StringValidator {
    -value : string
    -minLength : number
    -maxLength : number
}

class NumberValidator {
    -value : number
    -min : number
    -max : number
}


Project -- ProjectStatus
class ProjectStatus {
    <<enumeration>>
    ACTIVE
    FINISHED
}

class Project {
    +id : string
    +title : string
    +description : string
    +people : string
    +status : ProjectStatus
}


ProjectState --|> State
ProjectState --* Project : manages
class State {
    #items : Array
    addItem(item)
}

class ProjectState {
    instance : ProjectState$
    activeProjects : Array~Project~
    finishedProjects : Array~Project~
    -ProjectState()
    +getInstance()$
    +getProjectById(id : string) : Project
    +finishProject(id : string) : Project
    +reopenProject(id : string) : Project
}


ProjectItemComponent --|> UIComponent
ProjectItemComponent --* Project : display
ProjectListComponent --|> UIComponent
ProjectListComponent ..> Project : add new project
ProjectItemComponent ..|> Dragable
ProjectListComponent ..|> DragTarget
StatefulProjectListComponent --|> ProjectListComponent : extend with state
ActiveProjectListComponent --|> StatefulProjectListComponent : extend with active state
ActiveProjectListComponent "0..n" --> "1" ProjectState : finish an active project
FinishedProjectListComponent --|> StatefulProjectListComponent : extend with finished state
FinishedProjectListComponent "0..n" --> "1" ProjectState : reopen the finished project
ProjectInputComponent --|> UIComponent
ProjectInputComponent ..> StringValidator : validate title and description
ProjectInputComponent ..> NumberValidator : validate people
ProjectInputComponent "0..n" --> "1" ProjectState : add new project
class UIComponent {
    <<Abstract>>
    #htmlRootContainer
    #htmlElement
    #htmlTemplate

    UIComponent(rootId : string, templateId: string, position: string)
    render() : void
    #configure() : void*
    #buildHTMLElement()
}

class ProjectItemComponent {
    ProjectItemComponent(rootId : string, project : Project)
}

class ProjectListComponent {
    <<Abstract>>
    #projectListEl

    ProjectListComponent()
    #_addProject(project : Project)
}

class StatefulProjectListComponent {
    <<Abstract>>
    type: string*
}

class ActiveProjectListComponent

class FinishedProjectListComponent

class ProjectInputComponent {
    -titleInputEl
    -descriptionInputEl
    -peopleInputEl

    ProjectInputComponent()
}


class Dragable {
    <<Interface>>
    dragStartHandler(event : DragEvent) : void
    dragEndHandler(event : DragEvent) : void
}

class DragTarget {
    <<Interface>>
    dragOverHandler(event : DragEvent) : void
    dropHandler(event : DragEvent) : void
    dragLeaveHandler(event : DragEvent) : void
}
```