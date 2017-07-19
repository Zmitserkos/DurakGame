import {
  Component,
  OnInit
} from "@angular/core";

/*import {
  Validators,
  FormGroup,
  FormControl
} from "@angular/forms";*/

import {
  DurakGameService
} from "../services/durak-game-service";

@Component({
  selector: "init-cmp",
  templateUrl: "durak-game/templates/init.html"
})
export class InitCmp implements OnInit {
  userName: string;
  message: string;

  constructor(private _durakGame: DurakGameService) {

  }

  ngOnInit() {

    //this._durakGame.loadData();
  }

  playGame(): void {
    /**/
    if (!this.userName) {
      this._durakGame.message = "Insert your name";
      return;
    }

    this._durakGame.addUser(this.userName);
  }

}
