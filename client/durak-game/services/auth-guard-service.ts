import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import {
  DurakGameService
} from "../services/durak-game-service";

@Injectable()
export class AuthGuard {
  constructor(private _router: Router, private _durakGame: DurakGameService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    let newRoute: string;
    let userName: string = this._durakGame.getUserNameStorage();

    if (!userName || userName === '') {
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
      this._router.navigate([newRoute]);
      return false;
    } else {
      return true;
    }
  }
}
