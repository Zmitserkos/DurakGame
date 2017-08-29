import {
	Component
} from "@angular/core";

import {
  SocketService
} from "../services/socket-service";

@Component({
	selector: "app",
	templateUrl: "../templates/app.html",
	styleUrls: ["../styles/css/app.css"]
})
export class AppCmp {
  connection: any;

	constructor( private _socket: SocketService ) {
    //
		/*this.connection = _socket.getMessages().subscribe( (message: any) => {

      _socket.executeHandler(message);
		});*/
  }

	ngOnInit() { }
}
