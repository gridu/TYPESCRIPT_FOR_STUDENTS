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

interface AppRequest {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: User;
  params: Record<string, unknown>;
}

interface Subscription {
  unsubscribe: () => void;
}

class Observer<T> {
  private handlers: Handlers<T>;
  private isUnsubscribed: boolean;
  public _unsubscribe?: () => void;

  constructor(handlers: Handlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T) {
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

class Observable<T> {
  private _subscribe: (observer: Observer<T>) => () => void;

  constructor(subscribe: (observer: Observer<T>) => () => void) {
    this._subscribe = subscribe;
  }

  static from<U>(values: U[]) {
    return new Observable<U>((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: Handlers<T>): Subscription {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: Readonly<User> = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: AppRequest[] = [
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
  request: AppRequest
): { status: HTTPStatus; request: AppRequest } => {
  // handling of request
  return { status: HTTPStatus.OK, request };
};
const handleError = (error: Error) => {
  // handling of error
  return { status: HTTPStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
