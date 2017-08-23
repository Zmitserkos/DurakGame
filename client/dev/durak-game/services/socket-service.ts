import {
  Inject,
  Injectable
} from "@angular/core";

import {
  Observable
} from "rxjs/Observable";

import * as io from 'socket.io-client/socket.io'

@Injectable()
export class SocketService {
  private url = 'http://localhost:3333';
  private socket = io(this.url);

  public socketEventHandlers;

  constructor() {
    this.socketEventHandlers = Object.create(null);
  }

  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);

      this.socket.on('message', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    })
    //

    return observable;
  }

  socketEmit(type, data) {
    //
    this.socket.emit(type, data);
  }

  executeHandler(message) {
    //
//console.log('messsage ' + message.type);
    this.socketEventHandlers[message.type](message);
  }
}
