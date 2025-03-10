enum HttpMethod {
    POST = 'POST',
    GET = 'GET'
}
  
enum HttpStatus {
    OK = 200,
    INTERNAL_SERVER_ERROR = 500
}

type Handlers = {
    next?: (value: RequestType) => void;
    error?: (error: string) => void;
    complete?: () => void;
};

type RequestType = {
  method: string,
  host: string,
  path: string,
  body?: {
    name: string,
    age: number,
    roles: string[],
    createdAt: Date,
    isDeleated: boolean,
  },
  params?: {
    id?: undefined | string,
  },
};

class Observer {

    private handlers: Handlers;
    private isUnsubscribed: boolean;
    private _unsubscribe: () => void;

    constructor(handlers: Handlers) {
      this.handlers = handlers;
      this.isUnsubscribed = false;
      this._unsubscribe = () => {};
    }
  
    next(value: RequestType): void {
      if (this.handlers.next && !this.isUnsubscribed) {
        this.handlers.next(value);
      }
    }
  
    error(error: string): void {
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
    private _subscribe: (observer: Observer) => () => void;
    constructor(subscribe: (observer: Observer) => () => void) {
      this._subscribe = subscribe;
    }
  
    static from(values: RequestType[]): Observable {
      return new Observable((observer) => {
        values.forEach((value) => observer.next(value));
  
        observer.complete();
  
        return () => {
          console.log('unsubscribed');
        };
      });
    }
  
    subscribe(obs: Handlers): { unsubscribe: () => void } {
      const observer = new Observer(obs);
  
      // NOTE: not sure why this code is here, if we are meaning that _unsubscribe is a private method, we should not be able to access it from outside the class
      observer._unsubscribe = this._subscribe(observer);
  
      return ({
        unsubscribe() {
          observer.unsubscribe();
        }
      });
    }
  }
  
  const userMock = {
    name: 'User Name',
    age: 26,
    roles: [
      'user',
      'admin'
    ],
    createdAt: new Date(),
    isDeleated: false,
  };
  
  const requestsMock = [
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

  
  const handleRequest = (request: RequestType) => {
    // handling of request
    return {status: HttpStatus.OK};
  };
  const handleError = (error: string) => {
    // handling of error
    return {status: HttpStatus.INTERNAL_SERVER_ERROR};
  };
  
  const handleComplete: () => void = () => console.log('complete');
  
  const requests$: Observable = Observable.from(requestsMock);
  
  const subscription: { unsubscribe: () => void } = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
  });
  
  subscription.unsubscribe();
