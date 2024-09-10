type nextRequestHandler<T> = (request: T) => { status: number };
type errorRequestHandler<T> = (request: T) => { status: number };
type completeRequestHandler = () => void;

export interface RequestHandler<T> {
    next: nextRequestHandler<T>;
    error: errorRequestHandler<T>,
    complete: completeRequestHandler
}
