export class State<T> {
    constructor(
        protected items: T[] = [],
    ) {}

    addItem(item: T): T {
        this.items.push(item);
        return item;
    }
}
