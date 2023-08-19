import { Listener, Request_, Response_ } from "./types";


export class Observer implements Listener {
    private _onUnsubscribe: () => void = () => {}
    private isUnsubscribed: boolean = false

    constructor(
        private listener: Listener,
    ) {}
  
    get onUnsubscribe() {
      return this._onUnsubscribe;
    }

    set onUnsubscribe(newCall: () => void) {
      this._onUnsubscribe = newCall;
    }

    next(value: Request_): Response_ {
      this._checkSubscription();
      return this.listener.next(value);
    }
  
    error(error: string): Response_ {
      this._checkSubscription()
      const output = this.listener.error(error);
      this.unsubscribe();
      return output;
    }
  
    complete() {
      console.log('📞 Call complete method from the Observer object');
      if (!this.isUnsubscribed) {
        this.listener.complete();
      }
    }
  
    unsubscribe() {
      console.log('📞 Call unsubscribe method from the Observer object');
      this.isUnsubscribed = true;
      this.onUnsubscribe();
    }

    _checkSubscription(): void {
      if (this.isUnsubscribed) {
        throw Error('Observer was unsubscribed!');
      }
    }
  }