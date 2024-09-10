import {HttpRequest} from "../util/HttpRequest";
import {Observer} from "./Observer";
import {RequestHandler} from "./RequestHandler";

type subscribeFunction<T> = (observer: Observer<T>) => any;

export class Observable<T> {

    private readonly subscribeFunction: subscribeFunction<T>;

    private constructor(subscribeFunction: subscribeFunction<T>) {
        this.subscribeFunction = subscribeFunction;
    }

    static from<T>(values: HttpRequest<T>[]) {
        return new Observable((observer: Observer<HttpRequest<T>>) => {
            values.forEach((value: HttpRequest<T>) => observer.next(value));
            // Added error loop for testing
            values.forEach((value: HttpRequest<T>) => observer.error(value));
            observer.complete();
            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: RequestHandler<T>) {
        const observer = new Observer(obs);
        observer._unsubscribe = this.subscribeFunction(observer);
        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}
