class HTTPHandlers {
  next: (value: HTTPRequest) => void;
  error: (error: Error) => void;
  complete: () => void;
};

class Observer {
  _unsubscribe?: () => void;

  constructor(
    public handlers: HTTPHandlers,
    public isUnsubscribed: boolean = false
  ) {
  }

  next(value: HTTPRequest): void {
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

class Observable {
  private _subscribe: (observer: Observer) => (() => void);

  constructor(subscribe: (observer: Observer) => (() => void)) {
    this._subscribe = subscribe;
  }

  static from(values: HTTPRequest[]): Observable {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: HTTPHandlers): { unsubscribe: () => void } {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

type HTTPMethod = typeof HTTP_POST_METHOD | typeof HTTP_GET_METHOD;
type HTTPResponse = typeof HTTP_STATUS_OK | typeof HTTP_STATUS_INTERNAL_SERVER_ERROR;

type User = {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
};

type HTTPRequest = {
  method: HTTPMethod;
  host: string;
  path: string;
  params: Record<string, string>;
  body?: User;
};

type Status = {
  status: HTTPResponse
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: HTTPRequest[] = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: HTTPRequest): Status => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

const handleError = (error: Error): Status => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
