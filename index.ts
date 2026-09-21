// ==================== Types & Interfaces ====================

type HandlerNext<T> = (value: T) => void;
type HandlerError = (error: unknown) => void;
type HandlerComplete = () => void;

interface Handlers<T> {
  next?: HandlerNext<T>;
  error?: HandlerError;
  complete?: HandlerComplete;
}

type UnsubscribeCallback = () => void;

interface Subscription {
  unsubscribe: () => void;
}

type SubscribeFunction<T> = (observer: Observer<T>) => UnsubscribeCallback;

// ==================== Observer ====================

class Observer<T> {
  private handlers: Handlers<T>;
  private isUnsubscribed: boolean;
  // assigned externally by Observable.subscribe
  _unsubscribe?: UnsubscribeCallback;

  constructor(handlers: Handlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown): void {
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

// ==================== Observable ====================

class Observable<T> {
  private _subscribe: SubscribeFunction<T>;

  constructor(subscribe: SubscribeFunction<T>) {
    this._subscribe = subscribe;
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer: Observer<T>) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: Handlers<T>): Subscription {
    const observer = new Observer<T>(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

// ==================== HTTP constants as enums ====================

enum HTTP_METHOD {
  POST = 'POST',
  GET = 'GET',
}

enum HTTP_STATUS {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

// ==================== Domain types ====================

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

interface User {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleated: boolean;
}

interface HttpRequest {
  method: HTTP_METHOD;
  host: string;
  path: string;
  body?: User;
  params: Record<string, string>;
}

interface HttpResponse {
  status: HTTP_STATUS;
}

// ==================== Mock data ====================

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: [UserRole.USER, UserRole.ADMIN],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: HttpRequest[] = [
  {
    method: HTTP_METHOD.POST,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_METHOD.GET,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s',
    },
  },
];

// ==================== Handlers ====================

const handleRequest = (request: HttpRequest): HttpResponse => {
  // handling of request
  return { status: HTTP_STATUS.OK };
};

const handleError = (error: unknown): HttpResponse => {
  // handling of error
  return { status: HTTP_STATUS.INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log('complete');

// ==================== Usage ====================

const requests$ = Observable.from<HttpRequest>(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
