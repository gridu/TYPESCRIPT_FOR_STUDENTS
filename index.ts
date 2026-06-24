enum HttpMethods {
  GET = 'GET',
  POST = 'POST'
}

const HttpStatusCodes = {
  Ok: 200,
  InternalServerError: 500
} as const

export interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}
type UserType = 'user' |'admin'

export interface User {
  name: string,
  age: number,
  roles: UserType[];
  createdAt: Date,
  isDeleted: boolean
};

type RequestMock = {
  method: HttpMethods;
  host: string;
  path: string;
  body?: User; 
  params: Record<string, string>; 
};

type TeardownLogic = () => void;
type subscribeFn<T>= (observer: Observer<T>) => TeardownLogic | void;

// observer class
export class Observer<T> {
  public isUnsubscribed: boolean = false;
  public _unsubscribe?: TeardownLogic;
  constructor(private handlers: ObserverHandlers<T>) {}

  public next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  public error(error: unknown): void {
    if(!this.isUnsubscribed){
      this.handlers.error?.(error)
    this.unsubscribe();
  }
}

public complete(): void{
  if(!this.isUnsubscribed){
    this.handlers.complete?.();
    this.unsubscribe();
  }
}

public unsubscribe(): void{
  this.isUnsubscribed = true;
  if(this._unsubscribe){
    this._unsubscribe();
  }
}
}

// Observable class
export class Observable<T>{
  private _subscribe: subscribeFn<T>;

    constructor(subscribe: subscribeFn<T>) {
        this._subscribe = subscribe;
    }

  static from<U>(values: U[]): Observable<U>{

    return new Observable<U>((observer)=>{
      values.forEach((value) => observer.next(value))
      observer.complete();

      return () =>{
        console.log('unsubscrubed')
      };
    });
  }

  public subscribe(handlers: ObserverHandlers<T>){
    const observer = new Observer<T>(handlers);

    const tearDown = this._subscribe(observer); 

    if(typeof tearDown === 'function'){
      observer._unsubscribe = tearDown
    }

    return ({
      unsubscribe(){
        observer.unsubscribe();
      }
    })
  }
}

const userMock: User ={
  name: 'User Name',
  age: 26,
  roles: [ 'user', 'admin'
  ],
  createdAt: new Date(),
  isDeleted: false,
}

const requestMock: RequestMock[] =[
  {
    method: HttpMethods.POST,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HttpMethods.GET,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    }
  }
]

const handleRequest = (request: RequestMock) =>{
  return {status: HttpStatusCodes.Ok}
};

const handleError = (error: unknown) =>{
  return {status: HttpStatusCodes.InternalServerError}
};

const handleComplete = () => console.log('complete');

const request$ = Observable.from(requestMock);

const subscription = request$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
})

subscription.unsubscribe();

