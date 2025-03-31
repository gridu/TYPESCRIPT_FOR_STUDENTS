enum HTTP_METHOD {
  GET = "GET",
  POST = "POST",
}

enum HTTP_STATUS {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

enum RoleTypes {
  user = "user",
  admin = "admin",
}

type UserType = {
  name: string;
  age: number;
  roles: RoleTypes[];
  createdAt: Date;
  isDeleated: boolean;
};

type RequestType = {
  method: HTTP_METHOD;
  host: string;
  path: string;
  body?: UserType;
  params?: Object;
};

type HandersType = {
  next?: (value: any) => void;
  error?: (error: any) => void;
  complete?: () => void;
};

class Observer {
  handlers: HandersType;
  isUnsubscribed: boolean;
  _unsubscribe: () => void;

  constructor(handlers: HandersType) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: RequestType) {
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

type SubscribeType = (observer: Observer) => () => void;

class Observable {
  private _subscribe: SubscribeType;

  constructor(subscribe: SubscribeType) {
    this._subscribe = subscribe;
  }

  static from(values: RequestType[]) {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: HandersType) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: UserType = {
  name: "User Name",
  age: 26,
  roles: [RoleTypes.user, RoleTypes.admin],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: RequestType[] = [
  {
    method: HTTP_METHOD.POST,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_METHOD.GET,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: RequestType) => {
  // handling of request
  return { status: HTTP_STATUS.OK };
};
const handleError = (error: any) => {
  // handling of error
  return { status: HTTP_STATUS.INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
