interface ObserverStatus {
  status: HttpStatus;
}

interface ObserverError {
  code: number;
  text: string;
}

interface ObserverHandlers<T> {
  next: (value: T) => ObserverStatus;
  error: (value: ObserverError) => ObserverStatus;
  complete: () => void;
}

type ObserverUnsubscriber = () => void;

class Observer<T> {
  private isUnsubscribed = false;
  unsubscribeHolder: ObserverUnsubscriber | undefined;

  constructor(private handlers: ObserverHandlers<T>) {}

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: ObserverError): void {
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

    if (this.unsubscribeHolder) {
      this.unsubscribeHolder();
    }
  }
}

type ObservableSubscriber<T> = (observer: Observer<T>) => ObserverUnsubscriber;

class Observable<T> {
  private subscribeHolder: ObservableSubscriber<T>;

  constructor(subscribe: ObservableSubscriber<T>) {
    this.subscribeHolder = subscribe;
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

  subscribe(obs: ObserverHandlers<T>): { unsubscribe(): void } {
    const observer = new Observer(obs);

    observer.unsubscribeHolder = this.subscribeHolder(observer);

    return {
      unsubscribe(): void {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_METHOD = {
  post: "POST",
  get: "GET",
} as const;

type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

const HTTP_STATUS = {
  ok: 200,
  internalServerError: 500,
} as const;

type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

type User = {
  name: string;
  age: number;
  roles: Array<"user" | "admin">;
  createdAt: Date;
  isDeleted: boolean;
};

type HTTPRequest<T> = {
  method: HttpMethod;
  host: string;
  path: string;
  body?: T;
  params: Record<string, string>;
};

const userMock: User = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: HTTPRequest<User>[] = [
  {
    method: HTTP_METHOD.post,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_METHOD.get,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: HTTPRequest<User>): ObserverStatus => {
  // handling of request
  return { status: HTTP_STATUS.ok };
};

const handleError = (error: ObserverError): ObserverStatus => {
  // handling of error
  return { status: HTTP_STATUS.internalServerError };
};

const handleComplete = (): void => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
