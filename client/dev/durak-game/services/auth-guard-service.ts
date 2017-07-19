import { Injectable } from '@angular/core';
import {
  CanLoaded,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import {
  DurakGameService
} from "../services/durak-game-service";


@Injectable()
export class AuthGuard implements CanLoaded {
  constructor(/*private authService: AuthService,*/ private router: Router, private _durakGame: DurakGameService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {

    let newRoute: string;
//debugger;
    let userName: string = this._durakGame.getUserNameStorage();
    let lastActivity: number = this._durakGame.getLastActivityStorage();
    let now: number = Date.now();

    if (!userName || userName === '' || (now - lastActivity) > this._durakGame.timeout) {
      if (url !== '/') {
        newRoute = '/';
        this._durakGame.resetGameIdStorage();
      }
    } else {
      let gameId: number = this._durakGame.getGameIdStorage();

      if (gameId) {
        if (url === '/' || url === '/games') {
          newRoute = '/table';
        }
      } else {
        if (url === '/' || url === '/table') {
          newRoute = '/games';
        }
      }
    }

    if (newRoute) {
      this.router.navigate([newRoute]);
      return false;
    } else {
      return true;
    }
  }
}
