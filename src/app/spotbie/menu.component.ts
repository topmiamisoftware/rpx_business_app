import {Component, OnInit, ViewChild} from '@angular/core';
import {Preferences} from '@capacitor/preferences';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  @ViewChild('spotbieMainMenu') spotbieMainMenu;
  @ViewChild('spotbieHoveredApp') spotbieHoveredApp;

  constructor() {}

  ngOnInit() {
    // save timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    Preferences.set({
      key: 'spotbie_userTimeZone',
      value: userTimezone,
    });
  }
}
