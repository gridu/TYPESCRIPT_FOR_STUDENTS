enum HTTPMethod {
  POST = 'POST',
  GET = 'GET',
}

enum HTTPStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

interface User {
  readonly name: string;
  readonly age: number;
  readonly roles: readonly string[];
  readonly createdAt: Date;
  readonly isDeleted: boolean;
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleted: false,
};

interface RequestMock {
  readonly method: HTTPMethod;
  readonly host: string;
  readonly path: string;
  readonly body?: User;
  readonly params: Record<string, string>;
}

const requestsMock: readonly RequestMock[] = [
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

type ObserverHandlers<T> = {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

class Observer<T> {
  private readonly handlers: ObserverHandlers<T>;
  private isUnsubscribed: boolean;
  public _unsubscribe?: () => void;

  constructor(handlers: ObserverHandlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error): void {
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
  private readonly _subscribe: (observer: Observer<T>) => (() => void) | void;

  constructor(subscribe: (observer: Observer<T>) => (() => void) | void) {
    this._subscribe = subscribe;
  }

  static from<T>(values: readonly T[]): Observable<T> {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));
      observer.complete();
      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: ObserverHandlers<T>) {
    const observer = new Observer(obs);
    observer._unsubscribe = this._subscribe(observer) || undefined;
    return {
      unsubscribe: () => observer.unsubscribe(),
    };
  }
}

const handleRequest = (request: RequestMock): { status: HTTPStatus } => {
  // handling of request
  return { status: HTTPStatus.OK };
};

const handleError = (error: Error): { status: HTTPStatus } => {
  // handling of error
  return { status: HTTPStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

// Unsubscribing
subscription.unsubscribe();
