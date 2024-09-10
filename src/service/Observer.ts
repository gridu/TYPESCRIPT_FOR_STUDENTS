import {RequestHandler} from "./RequestHandler";

export class Observer<T> {
    private handler: RequestHandler<T>;
    private isUnsubscribed: boolean;
    public _unsubscribe?: () => void;

    constructor(handler: RequestHandler<T>) {
        this.handler = handler;
        this.isUnsubscribed = false;
    }

    public next(value: T) {
        if (this.handler.next && !this.isUnsubscribed) {
            this.handler.next(value);
        }
    }

    public error(error: T) {
        if (!this.isUnsubscribed) {
            if (this.handler.error) {
                this.handler.error(error);
            }
            this.unsubscribe();
        }
    }

    public complete() {
        if (!this.isUnsubscribed) {
            if (this.handler.complete) {
                this.handler.complete();
            }
            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true;
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}
