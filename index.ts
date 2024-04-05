export const enum HttpMethod {
  POST = "POST",
  GET = "GET",
}

export const enum HttpStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

export interface IHandlers<T> {
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
}

export interface IUser {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleted: boolean;
}

export interface IRequest {
  method: string;
  host: string;
  path: string;
  body?: IUser;
  params: { [key: string]: string };
}

class Observer<T> {
  private isUnsubscribed: boolean;
  private handlers: IHandlers<T>;

  constructor(handlers: IHandlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: any): void {
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

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  _unsubscribe?: () => void;
}

class Observable<T> {
  constructor(
    private _subscribe: (observer: Observer<T>) => (() => void) | undefined
  ) {}

  static from<T>(values: T[]): Observable<T> {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: IHandlers<T>) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: IUser = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: IRequest[] = [
  {
    method: HttpMethod.POST,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HttpMethod.GET,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: IRequest) => {
  return { status: HttpStatus.OK };
};
const handleError = (error: any) => {
  return { status: HttpStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
