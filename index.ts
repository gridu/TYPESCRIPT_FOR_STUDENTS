import {
  HTTPMethod,
  HTTPStatusCodeEnum,
  IObserver,
  ObserverHandlers,
  RolesEnum,
  SubscribeFn,
  UnsubscribeFn,
  User,
  UserRequest,
  StatusResponse
} from './types';

class Observer implements IObserver {
  isUnsubscribed: boolean;
  _unsubscribe: UnsubscribeFn | undefined;

  constructor(public handlers: ObserverHandlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: unknown) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown) {
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
  constructor(private readonly _subscribe: SubscribeFn) {
  }

  static from<T>(values: T[]): Observable {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

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

const HTTP_POST_METHOD: HTTPMethod = 'POST';
const HTTP_GET_METHOD: HTTPMethod = 'GET';

const HTTP_STATUS_OK = HTTPStatusCodeEnum.OK;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = HTTPStatusCodeEnum.SERVER_ERROR;

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: [
    RolesEnum.USER,
    RolesEnum.ADMIN,
  ],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: UserRequest[] = [
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

const handleRequest = <T>(request: T): StatusResponse<HTTPStatusCodeEnum.OK> => {
  // handling of request
  return {status: HTTP_STATUS_OK};
};
const handleError = <T>(error: T): StatusResponse<HTTPStatusCodeEnum.SERVER_ERROR> => {
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
