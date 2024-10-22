import { HttpStatus, IObserverError, THttpRequest, TUser } from './types';
import { requestsMock } from './mocks';
import { Observable } from './services/Observable';

const handleRequest = (_request: THttpRequest<TUser>) => {
    // handling of request
    return { status: HttpStatus.Ok };
};
const handleError = (_error: IObserverError) => {
    // handling of error
    return { status: HttpStatus.InternalServerError };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

subscription.unsubscribe();