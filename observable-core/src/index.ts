import { Request_, HTTPStatus } from "./types";
import { requestsMock } from "./mock";
import { Observable } from "./observable";


const handleRequest = (request: Request_) => {
  return {status: HTTPStatus.OK};
};

const handleError = (error: string) => {
  return {status: HTTPStatus.INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('✅ complete');


const requests = Observable.from(requestsMock);
const subscriber = requests.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});
subscriber.unsubscribe();