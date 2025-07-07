// Type Definitions
type HttpMethod = 'GET' | 'POST';
type UserRole = 'user' | 'admin';

interface User {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleated: boolean;
}

interface RequestBase {
  method: HttpMethod;
  host: string;
  path: string;
  params?: Record<string, any>;
}

interface PostRequest extends RequestBase {
  method: 'POST';
  body: User;
}

interface GetRequest extends RequestBase {
  method: 'GET';
}

type Request = PostRequest | GetRequest;

interface Response {
  status: number;
}

interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
}

interface Subscription {
  unsubscribe(): void;
}

// Observer Class
class Observer<T> {
  private isUnsubscribed = false;
  private _unsubscribe?: () => void;

  constructor(private handlers: ObserverHandlers<T>) {}

  next(value: T): void {
    if (!this.isUnsubscribed && this.handlers.next) {
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

  setUnsubscribe(unsub: () => void) {
    this._unsubscribe = unsub;
  }
}

// Observable Class
class Observable<T> {
  constructor(private _subscribeFn: (observer: Observer<T>) => () => void) {}

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer: Observer<T>) => {
      values.forEach((value) => observer.next(value));
      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(handlers: ObserverHandlers<T>): Subscription {
    const observer = new Observer<T>(handlers);
    const unsub = this._subscribeFn(observer);
    observer.setUnsubscribe(unsub);

    return {
      unsubscribe: () => observer.unsubscribe()
    };
  }
}

// Constants
const HTTP_POST_METHOD: HttpMethod = 'POST';
const HTTP_GET_METHOD: HttpMethod = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

// Mock Data
const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleated: false,
};

const requestsMock: Request[] = [
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
      id: '3f5h67s4s',
    },
  }
];

// Handlers
const handleRequest = (request: Request): Response => {
  // Simulate request handling
  console.log('Request handled:', request);
  return { status: HTTP_STATUS_OK };
};

const handleError = (error: unknown): Response => {
  console.error('Error occurred:', error);
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => {
  console.log('complete');
};

// Usage
const requests$ = Observable.from<Request>(requestsMock);
const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

// Unsubscribe explicitly
subscription.unsubscribe();
