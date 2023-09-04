## Class Diagram

```mermaid
classDiagram
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
```