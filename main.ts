enum Roles {
  USER = "user",
  ADMIN = "admin",
}
enum HttpMethods {
  HTTP_GET_METHOD = "GET",
  HTTP_POST_METHOD = "POST",
}
enum HttpStatus {
  HTTP_STATUS_OK = 200,
  HTTP_STATUS_INTERNAL_SERVER_ERROR = 500,
}
interface UserMockModelType {
  name: string;
  age: number;
  roles: Roles[];
  createdAt: Date;
  isDeleated: boolean;
}
interface RequestMockType {
  method: HttpMethods;
  host: string;
  path: string;
  body?: UserMockModelType;
  params?: {
    [key: string]: string;
  };
}
interface HandlersType {
  next: (value: RequestMockType) => void;
  error: (error?: string) => void;
  complete: () => void;
}
class Observer {
  public _unsubscribe: () => void;
  private isUnsubscribed: boolean;
  private handlers: HandlersType;
  constructor(handlers: HandlersType) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: RequestMockType) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error?: string) {
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
  private _subscribe;
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  static from(values: RequestMockType[]) {
    return new Observable((observer: Observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: HandlersType) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: UserMockModelType = {
  name: "User Name",
  age: 26,
  roles: [Roles.USER, Roles.ADMIN],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: RequestMockType[] = [
  {
    method: HttpMethods.HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HttpMethods.HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest: (request: RequestMockType) => {
  status: HttpStatus;
} = (request: RequestMockType) => {
  // handling of request
  return { status: HttpStatus.HTTP_STATUS_OK };
};
const handleError: (error?: string) => {
  status: HttpStatus;
} = (error) => {
  // handling of error
  return { status: HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
