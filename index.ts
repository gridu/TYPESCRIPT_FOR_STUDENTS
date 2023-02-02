
interface RequestBodyType {
  name: string;
  age: number;
  roles: Roles[];
  createdAt: Date;
  isDeleated: boolean,
};

interface RequestParamsType {
id?: string
};

interface RequestType {
method: string;
host: string;
path: string;
body?: RequestBodyType;
params?: RequestParamsType;
};

interface handlersType {
next: (value: RequestType) => void,
error: (error?: string) => void,
complete: () => void
};

interface Unsubscribe {
unsubscribe: () => void;
}

interface ObserverType extends handlersType {
handlers?: handlersType;
isUnsubscribed?: boolean;
_unsubscribe?: Function;
};

interface ObservableType {
_subscribe: subscribeType;
}

enum Roles {
USER = 'user',
ADMIN = 'admin'
}

type subscribeType = (observer: ObserverType) => Function;
type ObserverWithUnsubscribeType = ObserverType & Unsubscribe;

class Observer implements ObserverWithUnsubscribeType {
handlers: handlersType;
isUnsubscribed: boolean;
_unsubscribe?: Function;

constructor(handlers: handlersType) {
  this.handlers = handlers;
  this.isUnsubscribed = false;
}

next(value: RequestType) {
  if (this.handlers.next && !this.isUnsubscribed) {
    
    this.handlers.next(value);
  }
}

error(error?: string) {
  console.log('error triggered');
  
  if (!this.isUnsubscribed) {
    if (this.handlers.error) {
      console.log(error);
      
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

class Observable implements ObservableType {
_subscribe: subscribeType;

constructor(subscribe: subscribeType) {
  this._subscribe = subscribe;
}

static from(values: RequestType[]) {
  return new Observable((observer: ObserverType): Function  => {
    values.forEach((value) => observer.next(value));

    observer.complete();
    observer.error();

    return () => {
      console.log('unsubscribed');
    };
  });
}

subscribe(obs: ObserverType) {
  const observer: ObserverWithUnsubscribeType = new Observer(obs);

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


const userMock: RequestBodyType = {
name: 'User Name',
age: 26,
roles: [
  Roles.USER,
  Roles.ADMIN
],
createdAt: new Date(),
isDeleated: false,
};

const requestsMock: RequestType[] = [
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

const handleRequest = (request: RequestType) => {
// handling of request
return {status: HTTP_STATUS_OK};
};
const handleError = (error?: any) => {
// handling of error
return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const handlers: handlersType = {
next: handleRequest,
error: handleError,
complete: handleComplete
};

const subscription = requests$.subscribe(handlers);

subscription.unsubscribe();