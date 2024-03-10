import {
  Component,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import {MenuController} from '@ionic/angular';
import {LogInComponent} from './log-in/log-in.component';
import {BehaviorSubject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-menu-logged-out',
  templateUrl: './menu-logged-out.component.html',
  styleUrls: ['../menu.component.css'],
})
export class MenuLoggedOutComponent {
  @Output() myFavoritesEvt = new EventEmitter();
  @Output() openHome = new EventEmitter();

  @ViewChild('appLogin') appLogin: LogInComponent;

  logInWindow$ = new BehaviorSubject<boolean>(true);
  onForgotPassword$ = new BehaviorSubject<boolean>(false);

  constructor(private menuCtrl: MenuController, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const r = event as NavigationEnd;
        if (r.url.indexOf('forgot-password') > 0) {
          this.onForgotPassword$.next(true);
        }
      });
  }
  spawnCategories(type: number): void {
    this.logInWindow$.next(false);
    this.menuCtrl.close('main-menu');
  }

  home() {
    this.menuCtrl.close('main-menu');
    this.logInWindow$.next(true);

    if (this.onForgotPassword$.getValue()) {
      this.router.navigate(['/home']);
    }
  }
}
