import {
  Component,
  OnInit
} from "@angular/core";

import { Router } from "@angular/router";

import { DurakGameService } from "../services/durak-game-service";
import { SocketService } from "../services/socket-service";

import { User } from '../classes/user';

@Component({
  selector: "init-cmp",
  templateUrl: "durak-game/templates/init.html",
  styleUrls: ["durak-game/styles/css/init.css"]
})
export class InitCmp implements OnInit {
  userName: string;
  message: string;

  constructor(
    private durakGame: DurakGameService,
    private socket: SocketService,
    public router: Router
  ) {
    // Load socket event handlers
    socket.socketEventHandlers['add-user'] = (message) => {
      if (!message.error) {
        durakGame.user = new User(durakGame.tempUserName);

        // Save username to session storage
        durakGame.setUserNameStorage();

        // redirect to the page with info about all the games
        this.router.navigate(['/games']);
      } else {
        durakGame.message = message.error;
      }
    };

  }

  ngOnInit() {

  }

  playGame(): void {
    /**/
    if (!this.userName) {
      this.durakGame.message = "Insert your name";
      return;
    }

    this.durakGame.addUser(this.userName);
  }

}
