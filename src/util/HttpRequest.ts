import {HttpMethod} from "./HttpMethod";

export class HttpRequest<T> {

    private _method: HttpMethod;
    private _host: string;
    private _path: string;
    private _body?: T;
    private _params: Map<string, string>;

    constructor(method: HttpMethod, host: string, path: string, params: Map<string, string>, body?: T) {
        this._method = method;
        this._host = host;
        this._path = path;
        this._body = body;
        this._params = params;
    }

    get method(): HttpMethod {
        return this._method;
    }

    get host(): string {
        return this._host;
    }

    get path(): string {
        return this._path;
    }

    get body(): T | undefined {
        return this._body;
    }

    get params(): Map<string, string> {
        return this._params;
    }
}



