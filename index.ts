interface IUser {
    name: string;
    age: number;
    roles: string[];
    createdAt: Date;
    isDeleted: boolean;
  }
  
  interface IParams {
    id: string;
  }
  
  interface IRequest{
    method: Methods;
    host: string;
    path: string;
    params: Partial<IParams>;
    body?: IUser;
  }
  
  enum Methods {
    POST = "POST",
    GET = "GET",
  }
  
  enum Status {
    OK = 200,
    INTERNAL_SERVER_ERROR = 500,
  }
  
  interface IHandlers<T, K> {
    next?: (value: T) => void;
    error?: (value: K) => void;
    complete?: () => void;
  }
  
  class Observer<T extends IRequest, K extends Error> {
    isUnsubscribed: boolean;
    handlers: IHandlers<T, K>;
    _unsubscribe?: () => void;
  
    constructor(handlers: IHandlers<T, K>) {
      this.handlers = handlers;
      this.isUnsubscribed = false;
    }
  
    next(value: T) {
      if (this.handlers.next && !this.isUnsubscribed) {
        this.handlers.next(value);
      }
    }
  
    error(error: K) {
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
  
  class Observable<T extends IRequest, K extends Error> {
    _subscribe: (subscriber: Observer<T, K>) => () => void;
  
    constructor(subscribe: (subscriber: Observer<T, K>) => () => void) {
      this._subscribe = subscribe;
    }
  
    static from<T extends IRequest>(values: T[]) {
      return new Observable((observer) => {
        values.forEach((value) => observer.next(value));
  
        observer.complete();
  
        return () => {
          console.log("unsubscribed");
        };
      });
    }
  
    subscribe(obs: IHandlers<T, K>) {
      const observer = new Observer(obs);
  
      observer._unsubscribe = this._subscribe(observer);
  
      return {
        unsubscribe() {
          observer.unsubscribe();
        },
      };
    }
  }
  
  const userMock: IUser = {
    name: "User Name",
    age: 26,
    roles: ["user", "admin"],
    createdAt: new Date(),
    isDeleted: false,
  };
  
  const requestsMock: IRequest[] = [
    {
      method: Methods.POST,
      host: "service.example",
      path: "user",
      body: userMock,
      params: {},
    },
    {
      method: Methods.GET,
      host: "service.example",
      path: "user",
      params: {
        id: "3f5h67s4s",
      },
    },
  ];
  
  const handleRequest = (request: IRequest) => {
    // handling of request
    return { status: Status.OK };
  };
  const handleError = (error: Error) => {
    // handling of error
    return { status: Status.INTERNAL_SERVER_ERROR };
  };
  
  const handleComplete = () => console.log("complete");
  
  const requests$ = Observable.from(requestsMock);
  
  const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete,
  });
  
  subscription.unsubscribe();
  