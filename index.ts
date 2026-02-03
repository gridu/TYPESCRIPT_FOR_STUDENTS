enum HttpMethod {
  POST = 'POST', 
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
};

enum HttpStatus {
  Ok = 200,
  InternalServerError = 500
};

type UserType = 'admin' | 'user';

interface User {
  name: string;
  age: number;
  roles: UserType[];
  createdAt: Date;
  isDeleted: boolean;
};

interface MyRequest {
  method: string;
  host: string;
  path: string;
  body?: User;
  params: {
    id?: string;
  },
}

interface Result {
  status: number;
}

type TeardownFunc = () => void;
type SubscribeFunc<T> = (observer: Observer<T>) => TeardownFunc;

interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

interface Subscription {
  unsubscribe(): void;
}

class Observer<T> {
  private handlers: ObserverHandlers<T>;
  private isUnsubscribed: boolean;
  public _unsubscribe?: TeardownFunc;

  constructor(handlers: ObserverHandlers<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T): void {
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

class Observable<T> {
  private _subscribe: SubscribeFunc<T>;

  constructor(subscribe: SubscribeFunc<T>) {
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

  subscribe(obs: ObserverHandlers<T>): Subscription {
    const observer = new Observer<T>(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe(): void {
        observer.unsubscribe();
      }
    });
  }
}



const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: MyRequest[] = [
  {
    method: HttpMethod.POST,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HttpMethod.GET,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: MyRequest): Result => {
  // handling of request
  return {status: HttpStatus.Ok};
};
const handleError = (error: Error): Result => {
  // handling of error
  return {status: HttpStatus.InternalServerError};
};

const handleComplete = (): void => console.log('complete');

const requests$: Observable<MyRequest> = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
