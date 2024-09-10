import {HttpRequest} from "./util/HttpRequest";
import {HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK} from "./util/HttpUtil";
import {Observable} from "./service/Observable";
import {requestsMock} from "./util/MockData";
import {User} from "./model/User";

const handleRequest = (request: HttpRequest<User>) => {
    console.log(`Handling user ${request.body?.name}`);
    return {status: HTTP_STATUS_OK};
};
const handleError = (error: HttpRequest<User>) => {
    console.log(`Error happened for user ${error.body?.name}`);
    return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('Completed');

const requests = Observable.from<User>(requestsMock);

const subscription = requests.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});
subscription.unsubscribe();
