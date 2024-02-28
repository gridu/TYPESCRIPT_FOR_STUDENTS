class Observer<T> {
  isUnsubscribed: boolean;
  _unsubscribe?: () => void;

  constructor(private handlers: Handlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: any) {
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
  _subscribe: (observer: Observer<T>) => () => void;

  constructor(subscribe: (observer: Observer<T>) => () => void) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]) {
    return new Observable<T>((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: Handlers<T>) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: UserMock = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: RequestMock[] = [
  {
    method: HTTP_METHODS.GET,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_METHODS.POST,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: RequestMock) => {
  // handling of request
  return { status: HTTP_STATUSES.OK };
};
const handleError = (error: any) => {
  // handling of error
  return { status: HTTP_STATUSES.INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
