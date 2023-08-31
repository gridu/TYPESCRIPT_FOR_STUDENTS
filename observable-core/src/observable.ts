import { Observer } from "./observer";
import { Request_, Listener } from "./types";


export class Observable {
    private onSubscribe: (obs: Observer) => void

    private constructor(
        onSubscribe: (obs: Observer) => void
    ) {
      this.onSubscribe = onSubscribe;
    }
  
    static from(events: Request_[]): Observable {
      console.log("✔️  Create new observable object");
      
      return new Observable((observer) => {
        console.log("🟠 Trigger events from the Observable object");
        events.forEach((event) => observer.next(event));
        observer.complete();
      });
    }
  
    subscribe(newListener: Listener): Observer {
      console.log('✔️  Subscribe new listener');
      const observer = new Observer(newListener);
      console.log('✔️  New observer is created');
      observer.onUnsubscribe = () => console.log('🛑 unsubscribed!');
      this.onSubscribe(observer)
      return observer;
    }
  }