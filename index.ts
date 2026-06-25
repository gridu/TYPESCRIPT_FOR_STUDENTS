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

enum HttpMethod {
  Post = 'POST',
  Get = 'GET',
}

enum HttpStatus {
  Ok = 200,
  InternalServerError = 500,
}

enum UserRole {
  User = 'user',
  Admin = 'admin',
}

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
  roles: [UserRole.User, UserRole.Admin],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: ApiRequest<User>[] = [
  {
    method: HttpMethod.Post,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HttpMethod.Get,
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
    status: HttpStatus.Ok,
  };
};

const handleError = (error: unknown): ApiResponse => {
  // handling of error
  console.error(error);

  return {
    status: HttpStatus.InternalServerError,
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
