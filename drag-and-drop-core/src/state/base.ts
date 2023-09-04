import { modifiedProjectStateObservableEvent } from "../utils";
import { ObservableEvent } from "../decorators/observable";


export class State<T> {
    constructor(
        protected items: T[] = [],
    ) {}

    @ObservableEvent([modifiedProjectStateObservableEvent])
    addItem(item: T): T {
        this.items.push(item);
        return item;
    }
}
