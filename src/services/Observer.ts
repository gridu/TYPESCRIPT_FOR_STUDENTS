import { IHandlers, IObserverError, THttpRequest, TUser } from '../types';

export class Observer {
    private handlers: IHandlers;
    private isUnsubscribed: boolean;
    _unsubscribe?: () => void;

    constructor(handlers: IHandlers) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }

    next(value: THttpRequest<TUser>) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }

    error(error: IObserverError) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }

            this.unsubscribe();
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
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