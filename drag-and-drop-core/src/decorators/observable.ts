import { Observable } from "../utils/observable";


export function ObservableEvent<T>(observables: Observable<T>[]) {
    function decorator(_: any, _1: string, descriptor: PropertyDescriptor) {
        const newDescriptor: PropertyDescriptor = {
            configurable: descriptor.configurable,
            get() {
                return (...args: any[]) => {
                    let originalMethod;
                    if (descriptor.value) {
                        originalMethod = descriptor.value.bind(this);
                    } else {
                        originalMethod = descriptor.get?.apply(this, []);
                    }
                    const originalResponse = originalMethod(...args) as T;
                    observables.forEach((ob: Observable<T>) => ob.triggerEvent(originalResponse));
                    return originalResponse;
                }
            }
        }
        return newDescriptor;
    }
    return decorator;
}