type TeardownLogic = () => void;

interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
}

interface Subscription {
  unsubscribe: () => void;
}

class Observer<T> {
  private handlers: ObserverHandlers<T>;
  private isUnsubscribed = false;
  private teardown?: TeardownLogic;

  constructor(handlers: ObserverHandlers<T>) {
    this.handlers = handlers;
  }

  get closed(): boolean {
    return this.isUnsubscribed;
  }

  setTeardown(teardown?: TeardownLogic): void {
    if (!teardown) {
      return;
    }

    if (this.isUnsubscribed) {
      teardown();
      return;
    }

    this.teardown = teardown;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown): void {
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
    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    if (this.teardown) {
      this.teardown();
      this.teardown = undefined;
    }
  }
}

class Observable<T> {
  private readonly subscribeFn: (observer: Observer<T>) => TeardownLogic | void;

  constructor(subscribe: (observer: Observer<T>) => TeardownLogic | void) {
    this.subscribeFn = subscribe;
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer) => {
      for (const value of values) {
        if (observer.closed) {
          break;
        }

        observer.next(value);
      }

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(handlers: ObserverHandlers<T>): Subscription {
    const observer = new Observer<T>(handlers);
    const teardown = this.subscribeFn(observer);

    if (teardown) {
      observer.setTeardown(teardown);
    }

    return {
      unsubscribe(): void {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_POST_METHOD = 'POST' as const;
const HTTP_GET_METHOD = 'GET' as const;

type HttpMethod = typeof HTTP_POST_METHOD | typeof HTTP_GET_METHOD;

const HTTP_STATUS_OK = 200 as const;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500 as const;

type HttpStatus =
  | typeof HTTP_STATUS_OK
  | typeof HTTP_STATUS_INTERNAL_SERVER_ERROR;

type UserRole = 'user' | 'admin';

interface User {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleted: boolean;
}

interface BaseRequest {
  method: HttpMethod;
  host: string;
  path: string;
  params: Record<string, string>;
}

interface PostRequest<TBody> extends BaseRequest {
  method: typeof HTTP_POST_METHOD;
  body: TBody;
}

interface GetRequest extends BaseRequest {
  method: typeof HTTP_GET_METHOD;
}

type AppRequest = PostRequest<User> | GetRequest;

interface AppResponse {
  status: HttpStatus;
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: AppRequest[] = [
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

const handleRequest = (request: AppRequest): AppResponse => {
  // handling of request
  console.log(request);

  return { status: HTTP_STATUS_OK };
};

const handleError = (error: unknown): AppResponse => {
  // handling of error
  console.error(error);

  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => {
  console.log('complete');
};

const requests$ = Observable.from<AppRequest>(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();

export {};
