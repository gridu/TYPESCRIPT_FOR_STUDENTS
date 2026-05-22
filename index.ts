enum HttpMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

enum HttpStatusCodes {
    Ok = 200,
    InternalServerError = 500,
    BadRequest = 400,
    NotFound = 404,
    Unauthorized = 401,
    Forbidden = 403,
}

// Custom Error Interface to replace 'any'
interface CustomAppError {
    message: string;
    code: number;
    details?: string;
}

type UserType = 'user' | 'admin';

interface User {
    name: string;
    age: number;
    roles: UserType[];
    createdAt: Date;
    isDeleted: boolean;
}

interface CustomRequest {
    method: HttpMethods;
    host: string;
    path: string;
    body?: User;
    params: {
        id?: string;
    };
}

interface Result {
    status: HttpStatusCodes;
}

type TeardownFunc = () => void;

type SubscribeFunc<T> = (observer: Observer<T>) => TeardownFunc;

interface ObserverHandlers<T> {
    next?: (value: T) => void;
    error?: (error: CustomAppError) => void;
    complete?: () => void;
}

interface Subscription {
    unsubscribe: () => void;
}

class Observer<T> {
    private handlers: ObserverHandlers<T>;
    private isUnsubscribed: boolean;
    public _unsubscribe?: TeardownFunc;

    constructor(handlers: ObserverHandlers<T>) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }

    next(value: T): void {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }

    error(error: CustomAppError): void {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }
            this.unsubscribe();
        }
    }

    complete(): void {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }
            this.unsubscribe();
        }
    }

    unsubscribe(): void {
        this.isUnsubscribed = true;

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}

class Observable<T> {
    private _subscribe: SubscribeFunc<T>;

    constructor(subscribe: SubscribeFunc<T>) {
        this._subscribe = subscribe;
    }

    static from<K>(values: K[]): Observable<K> {
        return new Observable<K>((observer: Observer<K>) => {
            values.forEach((value) => observer.next(value));

            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: ObserverHandlers<T>): Subscription {
        const observer = new Observer<T>(obs);

        observer._unsubscribe = this._subscribe(observer);

        return {
            unsubscribe() {
                observer.unsubscribe();
            }
        };
    }
}

const userMock: User = {
    name: 'User Name',
    age: 26,
    roles: ['user', 'admin'],
    createdAt: new Date(),
    isDeleted: false,
};

const requestsMock: CustomRequest[] = [
    {
        method: HttpMethods.POST,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HttpMethods.GET,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];

const handleRequest = (request: CustomRequest): Result => {
    // handling of request
    return { status: HttpStatusCodes.Ok };
};

const handleError = (error: CustomAppError): Result => {
    console.error(`Error [${error.code}]: ${error.message}`);
    if (error.details) {
        console.error(`Details: ${error.details}`);
    }
    return { status: HttpStatusCodes.InternalServerError };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from<CustomRequest>(requestsMock);

const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

subscription.unsubscribe();