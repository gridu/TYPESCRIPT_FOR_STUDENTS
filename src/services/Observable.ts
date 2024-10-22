import { THttpRequest, TUser, IHandlers } from '../types';
import { Observer } from './Observer';

export class Observable {
    private readonly _subscribe: (observer: Observer) => () => void;

    constructor(subscribe: (observer: Observer) => () => void) {
        this._subscribe = subscribe;
    }

    static from(values: THttpRequest<TUser>[]) {
        return new Observable((observer: Observer) => {
            values.forEach((value) => observer.next(value));

            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: IHandlers) {
        const observer = new Observer(obs);

        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}