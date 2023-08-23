interface Handlers{
  next: Function,
  error:Function,
  complete: Function,
}

interface User{
  name: string,
  age: number,
  roles: string[],
  createdAt: Date,
  isDeleated: boolean,
}

class Observer {
  handlers: Handlers;
  isUnsubscribed: boolean;
  _unsubscribe: Function;

  constructor(handlers: Handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: Observer): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error): void {
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

class Observable {
  _subscribe: Function;

  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  static from(values) {
    return new Observable((observer: Observer): Function => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return (): void => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs): Object {
    const observer: Observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}

type HTTP_METHODS = 'POST' | 'GET';
type HTTP_STATUS = 200 | 500;

const HTTP_POST_METHOD: HTTP_METHODS = 'POST';
const HTTP_GET_METHOD: HTTP_METHODS = 'GET';

const HTTP_STATUS_OK: HTTP_STATUS = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: HTTP_STATUS = 500;


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

const requestsMock: {
  method: HTTP_METHODS,
  host: string,
  path: string,
  body?: object,
  params: object,
}[] = [
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

type RESPONSE = {status: HTTP_STATUS};

const handleRequest = (request): RESPONSE => {
  // handling of request
  return {status: HTTP_STATUS_OK};
};
const handleError = (error): RESPONSE => {
  // handling of error
  return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
