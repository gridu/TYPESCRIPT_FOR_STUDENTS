export enum HTTPStatusCodeEnum {
  OK = 200,
  SERVER_ERROR = 500,
}

export enum RolesEnum {
  USER = 'user',
  ADMIN = 'admin',
}

export type HTTPMethod = 'POST' | 'GET';

export type User = {
  name: string;
  age: number;
  roles: RolesEnum[];
  createdAt: Date;
  isDeleated: boolean
};

export type UserRequest = {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: User;
  params: Record<string, string>;
};

export type StatusResponse<HTTPStatusCodeEnum> = {
  status: HTTPStatusCodeEnum,
}

export type ObserverHandlers = {
  next: <T>(request: T) => void;
  error: <T>(error: T) => void;
  complete: () => void;
}

export type SubscribeFn = (observer: IObserver) => () => void;

export type UnsubscribeFn = () => void;

export interface IObserver {
  handlers: ObserverHandlers;
  next: <T>(value: T) => void;
  error: <T>(value: T) => void;
  complete: () => void;
  unsubscribe: () => void;
}

