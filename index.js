"use strict";
var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["POST"] = "POST";
    HTTPMethod["GET"] = "GET";
})(HTTPMethod || (HTTPMethod = {}));
var HTTPStatus;
(function (HTTPStatus) {
    HTTPStatus[HTTPStatus["OK"] = 200] = "OK";
    HTTPStatus[HTTPStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HTTPStatus || (HTTPStatus = {}));
const userMock = {
    name: 'User Name',
    age: 26,
    roles: ['user', 'admin'],
    createdAt: new Date(),
    isDeleted: false,
};
const requestsMock = [
    {
        method: HTTPMethod.POST,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTPMethod.GET,
        host: 'service.example',
        path: 'user',
        params: { id: '3f5h67s4s' },
    },
];
class Observer {
    constructor(handlers) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }
    next(value) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }
    error(error) {
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
class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    static from(values) {
        return new Observable((observer) => {
            values.forEach((value) => observer.next(value));
            observer.complete();
            return () => {
                console.log('unsubscribed');
            };
        });
    }
    subscribe(obs) {
        const observer = new Observer(obs);
        observer._unsubscribe = this._subscribe(observer) || undefined;
        return {
            unsubscribe: () => observer.unsubscribe(),
        };
    }
}
const handleRequest = (request) => {
    // handling of request
    return { status: HTTPStatus.OK };
};
const handleError = (error) => {
    // handling of error
    return { status: HTTPStatus.INTERNAL_SERVER_ERROR };
};
const handleComplete = () => console.log('complete');
const requests$ = Observable.from(requestsMock);
const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete,
});
// Unsubscribing
subscription.unsubscribe();
