import type {
  CompleteHandler,
  ErrorHandler,
  Handlers,
  HTTP_METHOD,
  HTTP_STATUS,
  NextHandler,
  ObservableLike,
  ObserverLike,
  Request,
  RequestError,
  Subscription,
  SubscribeFn,
  Unsubscribe,
  User,
} from './types';

class Observer implements ObserverLike {
  private handlers: Handlers;
  private isUnsubscribed: boolean;
  public _unsubscribe?: Unsubscribe;

  constructor(handlers: Handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: Request): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: RequestError): void {
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

class Observable implements ObservableLike {
  private _subscribe: SubscribeFn;

  constructor(subscribe: SubscribeFn) {
    this._subscribe = subscribe;
  }

  static from(values: Request[]): Observable {
    return new Observable((observer: ObserverLike): Unsubscribe => {
      values.forEach((value: Request) => observer.next(value));

      observer.complete();

      return (): void => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: Handlers): Subscription {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe(): void {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_POST_METHOD: HTTP_METHOD = 'POST';
const HTTP_GET_METHOD: HTTP_METHOD = 'GET';

const HTTP_STATUS_OK: HTTP_STATUS = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: HTTP_STATUS = 500;

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: Request[] = [
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
      id: '3f5h67s4s',
    },
  },
];

const handleRequest: NextHandler = (request: Request) => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

const handleError: ErrorHandler = (error: RequestError) => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete: CompleteHandler = () => console.log('complete');

const requests$: ObservableLike = Observable.from(requestsMock);

const subscription: Subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
