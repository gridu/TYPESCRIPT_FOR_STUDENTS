export enum HTTPStatus {
    OK = 200,
    INTERNAL_SERVER_ERROR = 500,
}

export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
}


export enum Role {
    User = 'user',
    Admin = 'admin',
}


export type User = {
    name: string;
    age: number;
    roles: Role[],
    createdAt: Date,
    isDeleated: boolean,
}


export type Request_ = {
    method: any;
    host: string;
    path: string;
    body?: any;
    params: object
}

export type Response_ = {
    status: HTTPStatus
}


export interface Listener {
    next: (request: Request_) => Response_;
    error: (error: string) => Response_;
    complete: () => void;
}