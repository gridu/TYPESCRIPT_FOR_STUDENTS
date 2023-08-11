enum HttpMethods {
  HTTP_POST_METHOD = 'POST',
  HTTP_GET_METHOD = 'GET'
}

enum HttpStatus {
  HTTP_STATUS_OK = 200,
  HTTP_STATUS_INTERNAL_SERVER_ERROR = 500
}

enum UserRoles {
  USER = 'user',
  ADMIN = 'admin'
}

type HttpRequest = {
  method: HttpMethods;
  host: string;
  path: string;
  body?: unknown;
  params: unknown;
};

type UserModel = {
  name: string;
  age: number;
  roles: UserRoles[],
  createdAt: Date;
  isDeleted: boolean;
}

interface Handlers {
  next: (request: HttpRequest) => {},
  error: (error: Error) => {},
  complete: () => void
}

class Observer {
  declare handlers: Handlers;
  declare isUnsubscribed: boolean;
  declare _unsubscribe: (observer: Observer) => void;

  constructor(handlers: Handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: HttpRequest) {
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
  declare _subscribe: (observer: Observer) => () => void;

  constructor(subscribe: (observer: Observer) => () => void) {
    this._subscribe = subscribe;
  }

  static from(values: HttpRequest[]) {
    return new Observable((observer: Observer) => {
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


const userMock: UserModel = {
  name: 'User Name',
  age: 26,
  roles: [
    UserRoles.USER,
    UserRoles.ADMIN
  ],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: HttpRequest[] = [
  {
    method: HttpMethods.HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HttpMethods.HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: HttpRequest) => {
  // handling of request
  return { status: HttpStatus.HTTP_STATUS_OK };
};

const handleError = (error: Error) => {
  // handling of error
  return { status: HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
