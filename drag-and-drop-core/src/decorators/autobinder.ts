export function Autobinder(_: any, _1: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor: PropertyDescriptor = {
        configurable: descriptor.configurable,
        get() {
            const newMethod = originalMethod.bind(this);
            return newMethod;
        }
    }
    return newDescriptor;
}
