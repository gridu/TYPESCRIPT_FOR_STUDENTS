import type { Request, RequestError } from './request';

export type ObserverLike = {
  next: (value: Request) => void;
  error: (error: RequestError) => void;
  complete: () => void;
};
