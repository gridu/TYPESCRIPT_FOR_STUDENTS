/**
 * Interface representing handlers passed to the Observer.
 */
interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
}

/**
 * Observer class that manages execution and handles stream states.
 */
class Observer<T> {
  private handlers: ObserverHandlers<T>;
  private isUnsubscribed: boolean;
  _unsubscribe?: () => void;

  constructor(handlers: ObserverHandlers<T>) {
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

/**
 * Type representing the subscription callback logic of the Observable.
 */
type SubscribeFunction<T> = (observer: Observer<T>) => (() => void) | void;

/**
 * Observable class representing a stream of values.
 */
class Observable<T> {
  private _subscribe: SubscribeFunction<T>;

  constructor(subscribe: SubscribeFunction<T>) {
    this._subscribe = subscribe;
  }

  /**
   * Creates an Observable stream from an array of values.
   */
  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer) => {
      values.forEach((value) => observer.next(value));
      observer.complete();
      return () => {
        console.log('unsubscribed');
      };
    });
  }

  /**
   * Subscribes to the stream with the provided observer handlers.
   */
  subscribe(obs: ObserverHandlers<T>): { unsubscribe: () => void } {
    const observer = new Observer<T>(obs);
    observer._unsubscribe = this._subscribe(observer) || undefined;
    return {
      unsubscribe() {
        observer.unsubscribe();
      }
    };
  }
}

// HTTP Methods Constants and Type
const HTTP_POST_METHOD = 'POST' as const;
const HTTP_GET_METHOD = 'GET' as const;

type HttpMethod = typeof HTTP_POST_METHOD | typeof HTTP_GET_METHOD;

// HTTP Status Constants
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

/**
 * Interface representing a User model.
 */
interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

/**
 * Interface representing a HTTP Request, parameterized by its payload/body type.
 */
interface HttpRequest<TBody = unknown> {
  method: HttpMethod;
  host: string;
  path: string;
  body?: TBody;
  params: Record<string, string>;
}

/**
 * Mock User data matching the interface.
 */
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

/**
 * Mock Request list matching HTTP request models.
 */
const requestsMock: HttpRequest<User>[] = [
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

interface RequestResponse {
  status: number;
}

/**
 * Request success handler.
 */
const handleRequest = (request: HttpRequest<User>): RequestResponse => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

/**
 * Request error handler.
 */
const handleError = (error: unknown): RequestResponse => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

/**
 * Request completion handler.
 */
const handleComplete = (): void => console.log('complete');

// Creating stream of HTTP Requests
const requests$ = Observable.from(requestsMock);

// Subscribing to the stream
const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

// Clean up/Unsubscribe
subscription.unsubscribe();
