// Enumerators, Types & Interfaces

enum HTTPMethod {
  POST = "POST",
  GET = "GET",
}

enum HTTPStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

type Handlers<T> = {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

type User = {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleted: boolean;
};

interface IAppRequest {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: User;
  params: Record<string, unknown>;
}

interface ISubscription {
  unsubscribe: () => void;
}

// OBSERVER & OBSERVABLE with generics

class Observer<T> {
  private handlers: Handlers<T>;
  private isUnsubscribed: boolean;
  public _unsubscribe?: () => void;

  constructor(handlers: Handlers<T>) {
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
  private _subscribe: (observer: Observer<T>) => () => void;

  constructor(subscribe: (observer: Observer<T>) => () => void) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer) => {
      values.forEach((value) => observer.next(value));
      observer.complete();
      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: Handlers<T>): ISubscription {
    const observer = new Observer(obs);
    observer._unsubscribe = this._subscribe(observer);
    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

// USAGE & MOCK DATA

// userMock Readonly to prevent accidental mutation.
const userMock: Readonly<User> = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: IAppRequest[] = [
  {
    method: HTTPMethod.POST,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTPMethod.GET,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (
  request: IAppRequest
): { status: HTTPStatus; request: IAppRequest } => {
  console.log(`Handling request: ${request.method} ${request.path}`);
  return { status: HTTPStatus.OK, request };
};

const handleError = (error: Error): { status: HTTPStatus } => {
  console.error(`Handling error: ${error.message}`);
  return { status: HTTPStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$: Observable<IAppRequest> = Observable.from(requestsMock); // The observable emits IAppRequest type values.

const subscription: ISubscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();