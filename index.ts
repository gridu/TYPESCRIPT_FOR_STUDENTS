interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
}

interface Subscription {
  unsubscribe(): void;
}

type UnsubscribeFunction = () => void;

type SubscribeFunction<T> = (observer: Observer<T>) => UnsubscribeFunction;

class Observer<T> {
  private readonly handlers: ObserverHandlers<T>;
  private isUnsubscribed: boolean;
  private unsubscribeFunction?: UnsubscribeFunction;

  constructor(handlers: ObserverHandlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T): void {
    if (this.isUnsubscribed) {
      return;
    }

    this.handlers.next?.(value);
  }

  error(error: unknown): void {
    if (this.isUnsubscribed) {
      return;
    }

    this.handlers.error?.(error);
    this.unsubscribe();
  }

  complete(): void {
    if (this.isUnsubscribed) {
      return;
    }

    this.handlers.complete?.();
    this.unsubscribe();
  }

  setUnsubscribe(unsubscribeFunction: UnsubscribeFunction): void {
    this.unsubscribeFunction = unsubscribeFunction;

    if (this.isUnsubscribed) {
      this.unsubscribeFunction();
      this.unsubscribeFunction = undefined;
    }
  }

  unsubscribe(): void {
    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    if (this.unsubscribeFunction) {
      this.unsubscribeFunction();
      this.unsubscribeFunction = undefined;
    }
  }
}

class Observable<T> {
  private readonly subscribeFunction: SubscribeFunction<T>;

  constructor(subscribeFunction: SubscribeFunction<T>) {
    this.subscribeFunction = subscribeFunction;
  }

  static from<T>(values: readonly T[]): Observable<T> {
    return new Observable<T>((observer: Observer<T>) => {
      values.forEach((value) => {
        observer.next(value);
      });

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(handlers: ObserverHandlers<T>): Subscription {
    const observer = new Observer<T>(handlers);
    const unsubscribeFunction = this.subscribeFunction(observer);

    observer.setUnsubscribe(unsubscribeFunction);

    return {
      unsubscribe(): void {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_METHOD = {
  post: 'POST',
  get: 'GET',
} as const;

const HTTP_STATUS = {
  ok: 200,
  internalServerError: 500,
} as const;

const USER_ROLE = {
  user: 'user',
  admin: 'admin',
} as const;

type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

interface User {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleted: boolean;
}

type RequestParams = Record<string, string>;

interface ApiRequest<TBody = unknown> {
  method: HttpMethod;
  host: string;
  path: string;
  params: RequestParams;
  body?: TBody;
}

interface ApiResponse {
  status: HttpStatus;
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: [USER_ROLE.user, USER_ROLE.admin],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: ApiRequest<User>[] = [
  {
    method: HTTP_METHOD.post,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_METHOD.get,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s',
    },
  },
];

const handleRequest = (request: ApiRequest<User>): ApiResponse => {
  // handling of request
  console.log(request.method, request.path);

  return {
    status: HTTP_STATUS.ok,
  };
};

const handleError = (error: unknown): ApiResponse => {
  // handling of error
  console.error(error);

  return {
    status: HTTP_STATUS.internalServerError,
  };
};

const handleComplete = (): void => {
  console.log('complete');
};

const requests$ = Observable.from<ApiRequest<User>>(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
