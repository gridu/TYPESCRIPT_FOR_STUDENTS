type RequestType = {
  method: string;
  host: string;
  path: string;
  body?: User;
  params?: {
      [key: string]: string;
  }
}

type ObserverHandlers = {
    next: (value: RequestType) => void;
    error: (error: Error) => void;
    complete: () => void;
}

class Observer {
    private handlers: ObserverHandlers;
    private isUnsubscribed: boolean;
    _unsubscribe: () => void;

    constructor(handlers: ObserverHandlers) {
      this.handlers = handlers;
      this.isUnsubscribed = false;
    }
  
    next(value: RequestType) {
      if (this.handlers.next && !this.isUnsubscribed) {
        this.handlers.next(value);
      }
    }
  
    error(error: Error) {
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
    private _subscribe: (observer: Observer) => () => void;

    constructor(subscribe: (observer: Observer) => () => void) {
        this._subscribe = subscribe;
    }

    static from(values: RequestType[]) {
        return new Observable((observer: Observer) => {
            values.forEach((value: RequestType) => observer.next(value));

            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: ObserverHandlers) {
        const observer = new Observer(obs);

        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}
  
const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

type User =  {
    name: string;
    age: number;
    roles: string[];
    createdAt: Date;
    isDeleated: boolean;
}

const userMock: User = {
    name: 'User Name',
    age: 26,
    roles: [
        'user',
        'admin'
    ],
    createdAt: new Date(),
    isDeleated: false,
};

const requestsMock: RequestType[] = [
    {
        method: HTTP_POST_METHOD,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTP_GET_METHOD,
        host: 'service.example',
        path: 'user',
        params: {
        id: '3f5h67s4s'
        },
    }
];

const handleRequest = (request: RequestType) => {
    // handling of request
    return {status: HTTP_STATUS_OK};
};
const handleError = (error: Error) => {
    // handling of error
    return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

subscription.unsubscribe();
