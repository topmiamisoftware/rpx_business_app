import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {UserauthService} from '../../services/userauth.service';
import {MapComponent} from '../map/map.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {LoyaltyPointsService} from '../../services/loyalty-points/loyalty-points.service';
import {AccountTypes} from '../../helpers/enum/account-type.enum';
import {SettingsComponent} from './settings/settings.component';
import {logOutCallback} from '../../helpers/logout-callback';
import {BehaviorSubject, take} from 'rxjs';
import {MenuController} from '@ionic/angular';
import {Preferences} from '@capacitor/preferences';

@Component({
  selector: 'app-menu-logged-in',
  templateUrl: './menu-logged-in.component.html',
  styleUrls: ['../menu.component.css', './menu-logged-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuLoggedInComponent implements AfterViewInit {
  // @ViewChild('spotbieMainMenu') spotbieMainMenu: ElementRef;
  @ViewChild('spotbieMap') spotbieMap: MapComponent;
  @ViewChild('spotbieSettings') spotbieSettings: SettingsComponent;

  foodWindow = {open: false};
  mapApp$ = new BehaviorSubject<boolean>(false);
  settingsWindow$ = new BehaviorSubject<boolean>(false);
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  userType: number;
  userLoyaltyPoints$ = this.loyaltyPointsService.userLoyaltyPoints$;
  userName: string = null;
  qrCode = false;
  business = false;
  eventMenuOpen = false;

  constructor(
      private userAuthService: UserauthService,
      private deviceService: DeviceDetectorService,
      private loyaltyPointsService: LoyaltyPointsService,
      private menuCtrl: MenuController
  ) {
    this.isMobile = this.deviceService.isMobile();
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();

    this.init();
  }

  async init() {
    const retAccType = await Preferences.get({key: 'spotbie_userType'});

    this.userType = parseInt(retAccType.value);

    if (this.userType === AccountTypes.Personal) {
      this.business = false;
    } else {
      this.business = true;
    }

    const retAccLogin = await Preferences.get({key: 'spotbie_userLogin'});
    this.userName = retAccLogin.value;

    this.getLoyaltyPointBalance();
  }

  toggleLoyaltyPoints() {
    this.spotbieMap.goToLp();
  }

  toggleQRScanner() {
    this.spotbieMap.goToQrCode();
  }

  spawnCategories(category: number): void {
    this.menuCtrl.close('logged-in-menu');

    this.slideMenu();
    this.spotbieMap.spawnCategories(category);
  }

  home() {
    this.menuCtrl.close('logged-in-menu');

    this.settingsWindow$.next(false);
    this.foodWindow.open = false;
    this.eventMenuOpen = false;

    this.spotbieMap.openWelcome();
    this.spotbieMap.closeCategories();
  }

  slideMenu() {
    if (this.settingsWindow$.getValue()) {
      this.settingsWindow$.next(false);
    }
  }

  openSettings() {
    this.menuCtrl.close('logged-in-menu');

    if (this.settingsWindow$.getValue()) {
      return;
    }
    this.settingsWindow$.next(true);

    setTimeout(() => {
      this.spotbieSettings.changeAccType();
    }, 500);
  }

  closeSettings() {
    this.settingsWindow$.next(false);
    // Refresh the settings.
    this.userAuthService.getSettings().pipe(take(1)).subscribe();
  }

  logOut(): void {
    this.userAuthService.logOut().subscribe(resp => {
      logOutCallback(resp);
    });
  }

  async getLoyaltyPointBalance() {
    await this.loyaltyPointsService.getLoyaltyPointBalance();
  }

  ngAfterViewInit() {
    this.mapApp$.next(true);
  }
}
