export enum Role {
    USER  = 'user',
    ADMIN = 'admin'
}

export type TUser = {
    name: string;
    age: number;
    roles: Role[];
    createdAt: Date,
    isDeleted: boolean,
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
}

interface IHttpParams { id?: string }

export type THttpRequest<T> = {
    method: HttpMethod,
    host: string,
    path: string,
    body?: T,
    params: IHttpParams,
}

interface IObserverStatus {
    status: HttpStatus;
}

export enum HttpStatus {
    Ok = 200,
    InternalServerError = 500,
}

export interface IObserverError {
    code: number;
    text: string;
}

export interface IHandlers {
    next: (request: THttpRequest<TUser>) => IObserverStatus,
    error: (error: IObserverError) => IObserverStatus,
    complete: () => void,
}