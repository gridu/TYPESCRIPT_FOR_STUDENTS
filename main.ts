interface UserMockModel {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}
enum HttpMethods {
  HTTP_GET_METHOD = "GET",
  HTTP_POST_METHOD = "POST",
}
enum HttpStatus {
  HTTP_STATUS_OK = 200,
  HTTP_STATUS_INTERNAL_SERVER_ERROR = 500,
}
interface RequestMockModel {
  method: HttpMethods;
  host: string;
  path: string;
  body?: UserMockModel;
  params?: {
    [key: string]: string;
  };
}
interface handlersType {
next: (value: RequestMockModel) => void,
error: (error?: string) => void,
complete: () => void
};
// interface ObserverType {
//   next: () =>void;
//   complete: () => void;
  

// }
class Observer {
  _unsubscribe: ()=>void;
  isUnsubscribed:boolean;
  handlers:Observer;
  constructor(handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error) {
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
  public _subscribe;
  // public _unsubscribe;
  constructor(subscribe: RequestMockModel) {
    this._subscribe = subscribe;
  }

  static from(values) {
    return new Observable((observer: handlersType) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: UserMockModel = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: RequestMockModel[] = [
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

const handleRequest: (request: RequestMockModel) => {
  status: HttpStatus;
} = (request) => {
  // handling of request
  return { status: HttpStatus.HTTP_STATUS_OK };
};
const handleError:(error: any) => {
    status: HttpStatus;
} = (error) => {
  // handling of error
  return { status: HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription  = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
