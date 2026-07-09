import type { Handlers } from './handlers';
import type { ObserverLike } from './observer';
import type { Request } from './request';
import type { Subscription, Unsubscribe } from './subscription';

export type SubscribeFn = (observer: ObserverLike) => Unsubscribe;

export type ObservableLike = {
  subscribe: (handlers: Handlers) => Subscription;
};

export type ObservableFactory = {
  from: (values: Request[]) => ObservableLike;
};
