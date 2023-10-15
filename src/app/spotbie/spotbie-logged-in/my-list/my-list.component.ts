import {Component, OnInit, AfterViewInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-my-list',
  templateUrl: './my-list.component.html',
  styleUrls: ['./my-list.component.css'],
})
export class MyList implements OnInit, AfterViewInit {
  currentTitle$ = new BehaviorSubject<string>(null);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const navEnd = event as NavigationEnd;
        this.setPageTitle(navEnd);
        setTimeout(() => this.setTopMargin(), 500);
      });
  }

  setPageTitle(navEnd: NavigationEnd): void {
    let title = 'Balance List';

    if (navEnd.url.indexOf('rewards') > 0) {
      title = 'My Rewards';
    } else if (navEnd.url.indexOf('balance-list') > 0) {
      title = 'Balance List';
    } else if (navEnd.url.indexOf('redeemed') > 0) {
      title = 'Redeemed Points';
    } else if (navEnd.url.indexOf('ledger') > 0) {
      title = 'My Ledger';
    }

    this.currentTitle$.next(title);
    return;
  }

  setTopMargin() {
    const toolbarHeight =
      document.getElementsByClassName('my-list-header')[0].clientHeight;

    const a = document.getElementsByClassName('redeemWindowNavMargin');

    for (let i = 0; i < a.length; i++) {
      (a[i] as HTMLElement).style.marginTop = toolbarHeight - 5 + 'px';
    }

    console.log('toolbarHeight', toolbarHeight);
  }

  ngOnInit(): void {}

  ngAfterViewInit() {}
}
