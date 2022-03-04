enum HTTP {
  POST_METHOD = 'POST',
  GET_METHOD = 'GET',

  STATUS_OK = 200,
  STATUS_INTERNAL_SERVER_ERROR = 500
}

type StatusOk = {
  status: HTTP.STATUS_OK
}

type StatusInernalError = {
  status: HTTP.STATUS_INTERNAL_SERVER_ERROR
}

type NextFunc = (request: Function | RequestOptions) => StatusOk | void
type ErrorFunc = (error: never) => StatusInernalError | void

type Handlers = {
  next: NextFunc,
  error: ErrorFunc,
  complete: () => void
}

type Subscribe = (observer: Handlers) => () => void

type User = {
  name: string,
  age: number,
  roles: string[],
  createdAt: Date,
  isDeleated: boolean
}

type RequestOptions = {
  method: HTTP.POST_METHOD | HTTP.GET_METHOD,
  host: string,
  path: string,
  params: {
    id?: string
  },
  body?: User,
}

interface IObserver {
  handlers: Handlers,
  isUnsubscribed: boolean
}


class Observer implements IObserver {
  handlers: Handlers
  isUnsubscribed: boolean
  _unsubscribe: () => void

  constructor(handlers: Handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: Function | RequestOptions) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: never) {
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
  _subscribe: Subscribe
  _unsubscribe: () => void

  constructor(subscribe: Subscribe) {
    this._subscribe = subscribe;
  }

  static from(values: RequestOptions[]) {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: Handlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
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

const requestsMock: RequestOptions[] = [
  {
    method: HTTP.POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP.GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest: NextFunc = (request) => {
  // handling of request
  return {status: HTTP.STATUS_OK};
};
const handleError: ErrorFunc = (error) => {
  // handling of error
  return {status: HTTP.STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
