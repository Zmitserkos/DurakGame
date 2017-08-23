'use strict';

import {
	Component
} from "@angular/core";

import {
  SocketService
} from "./durak-game/services/socket-service";

@Component({
	selector: "app",
	templateUrl: "durak-game/templates/app.html",
	styleUrls: ["durak-game/styles/css/app.css"]
})
export class App {
  connection: any;

	constructor( public socket: SocketService ) {
    //
		this.connection = socket.getMessages().subscribe( (message: any) => {

      socket.executeHandler(message);
		});
  }

	ngOnInit() { }
}
