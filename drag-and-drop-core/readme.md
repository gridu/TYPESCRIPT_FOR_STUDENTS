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
