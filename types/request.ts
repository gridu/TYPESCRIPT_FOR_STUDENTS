import type { HTTP_STATUS } from './http';
import type { User } from './user';

export type PostRequest = {
  method: 'POST';
  host: string;
  path: string;
  body: User;
  params?: Record<string, string>;
};

export type GetRequest = {
  method: 'GET';
  host: string;
  path: string;
  params: Record<string, string>;
};

export type Request = PostRequest | GetRequest;

export type RequestError = {
  message: string;
  code?: string;
};

export type HandlerResponse = {
  status: HTTP_STATUS;
};
