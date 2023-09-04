type EvListener<T> = (item: T) => void;

export class Observable<T> {
    constructor(
        private eventListeners: EvListener<T>[] = []
    ) { }

    addEventListener(newEventListener: EvListener<T>) {
        this.eventListeners.push(newEventListener);
    }

    triggerEvent(item: T) {
        for (const listener of this.eventListeners) {
            listener(item);
        }
    }
}
