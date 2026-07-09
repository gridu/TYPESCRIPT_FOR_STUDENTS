import type { Request, RequestError, HandlerResponse } from './request';

export type NextHandler = (request: Request) => HandlerResponse;
export type ErrorHandler = (error: RequestError) => HandlerResponse;
export type CompleteHandler = () => void;

export type Handlers = {
  next?: NextHandler;
  error?: ErrorHandler;
  complete?: CompleteHandler;
};
