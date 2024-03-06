import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {UserauthService} from '../../services/userauth.service';
import {MapComponent} from '../map/map.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {SettingsComponent} from './settings/settings.component';
import {logOutCallback} from '../../helpers/logout-callback';
import {BehaviorSubject, Observable, take} from 'rxjs';
import {MenuController} from '@ionic/angular';
import {LoyaltyPointsState} from "./state/lp.state";
import {BusinessLoyaltyPointsState} from "./state/business.lp.state";
import {AllowedAccountTypes} from '../../helpers/enum/account-type.enum';
import {MatDialog} from "@angular/material/dialog";
import {FoodTruckLocationDialogComponent} from "./food-truck-location/food-truck-location-dialog.component";
import {faTruck} from "@fortawesome/free-solid-svg-icons";
import {map, tap} from "rxjs/operators";

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

  faFoodTruck = faTruck;

  eAllowedAccountTypes = AllowedAccountTypes;
  foodWindow = {open: false};
  mapApp$ = new BehaviorSubject<boolean>(false);
  settingsWindow$ = new BehaviorSubject<boolean>(false);
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  userType$ = this.userAuthService.userProfile$.pipe(map((userProfile) => userProfile.spotbie_user.user_type));
  userName: string = null;
  qrCode = false;
  business = false;
  eventMenuOpen = false;
  userLoyaltyPoints$: Observable<number>;
  user$ = this.userAuthService.userProfile$;

  constructor(
      private userAuthService: UserauthService,
      private deviceService: DeviceDetectorService,
      private menuCtrl: MenuController,
      private loyaltyPointState: LoyaltyPointsState,
      private businessLoyaltyPointsState: BusinessLoyaltyPointsState,
      public dialog: MatDialog
  ) {
    this.isMobile = this.deviceService.isMobile();
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
  }

  toggleLoyaltyPoints() {
    this.spotbieMap.goToLp();
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

  getLoyaltyPointBalance() {
    this.loyaltyPointState.getLoyaltyPointBalance().subscribe(r => {
      this.userLoyaltyPoints$ = this.loyaltyPointState.balance$;
    });
  }

  getBusinessLoyaltyPointBalance() {
    this.businessLoyaltyPointsState
      .getBusinessLoyaltyPointBalance()
      .subscribe();
  }

  updateFoodTruck() {
    const dialogRef = this.dialog.open(FoodTruckLocationDialogComponent, {
      height: '100vh',
      width: '100%',
      autoFocus: false,
    });
  }

  ngAfterViewInit() {
    this.mapApp$.next(true);
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();

    this.business = true;
    this.getBusinessLoyaltyPointBalance();

    this.userName = localStorage.getItem('spotbie_userLogin');
  }
}
