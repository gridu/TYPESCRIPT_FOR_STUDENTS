enum HttpStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Role = "user" | "admin";

interface User {
  name: string;
  age: number;
  roles: Role[];
  createdAt: Date;
  isDeleted: boolean;
}

namespace App {
  export interface Request<T extends object, U extends object> {
    method: HttpMethod;
    path: string;
    body?: T;
    host: string;
    params: U;
  }

  export interface Response {
    status: HttpStatus;
  }

  export interface Error {
    message: string;
    code: number;
    details?: string;
  }
}

type TeardownFn = () => void;

interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: App.Error) => void;
  complete?: () => void;
}

class Observer<T> {
  private isUnsubscribed: boolean = false;

  constructor(
    private handlers: ObserverHandlers<T>,
    public _unsubscribe?: TeardownFn,
  ) {}

  public next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  public error(error: App.Error): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  public complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  public unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

type SubscribeFn<T> = (observer: Observer<T>) => TeardownFn;

interface Subscription {
  unsubscribe: () => void;
}

class Observable<T> {
  constructor(private _subscribe: SubscribeFn<T>) {}

  public static from<U>(values: U[]): Observable<U> {
    return new Observable<U>((observer: Observer<U>) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  public subscribe(obs: ObserverHandlers<T>): Subscription {
    const observer = new Observer<T>(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: User = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

type Params = {
  id: string;
};

type MockRequest = App.Request<User, Partial<Params>>;

const requestMock: MockRequest[] = [
  {
    method: "POST",
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: "GET",
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: MockRequest): App.Response => {
  return {
    status: HttpStatus.OK,
  };
};

const handleError = (error: App.Error): App.Response => {
  console.error(`Error [${error.code}]: ${error.message}`);
  if (error.details) {
    console.error(`Details: ${error.details}`);
  }

  return { status: HttpStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log("complete");

const requests$ = Observable.from<MockRequest>(requestMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
