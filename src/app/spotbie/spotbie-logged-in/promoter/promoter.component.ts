import {Component, EventEmitter, OnInit, Output, signal} from '@angular/core';
import {Router} from "@angular/router";
import {Business} from "../../../models/business";
import {Observable} from "rxjs/internal/Observable";
import {BehaviorSubject, of} from "rxjs";
import {PromoterService} from "./promoter.service";
import {Capacitor} from "@capacitor/core";
import {Geolocation} from "@capacitor/geolocation";
import {AndroidSettings, IOSSettings, NativeSettings} from "capacitor-native-settings";
import {location} from "ionicons/icons";
import {filter, tap} from "rxjs/operators";

@Component({
  selector: 'app-promoter',
  templateUrl: './promoter.component.html',
  styleUrls: ['./promoter.component.scss'],
})
export class PromoterComponent  implements OnInit {

  showBusiness$ = new BehaviorSubject(false);
  businessList$: Observable<Business[]> = of([]);
  selectedBusiness$: BehaviorSubject<Business> = new BehaviorSubject(null);
  location$ = new BehaviorSubject<{coords: { latitude: number; longitude: number}} >(null);

  day$ = signal<string>(null);
  timeRange1$ = signal<string>(null);
  timeRange2$ = signal<string>(null);
  timeRange3$ = signal<string>(null);

  constructor(
    private router: Router,
    private promoterService: PromoterService,
  ) {
    this.location$.pipe(
      filter(a => !!a),
      tap(a => {
        let loc_x = a.coords.latitude.toString();
        let loc_y = a.coords.longitude.toString();
        this.promoterService.updateTabletLocation({loc_x, loc_y});
    })).subscribe();
  }

  setTime(time, event) {
    switch(time) {
      case 1:
        this.timeRange1$.set(event.target.valueAsNumber);
        break;
      case 2:
        this.timeRange2$.set(event.target.valueAsNumber);
        break;
      case 3:
        this.timeRange3$.set(event.target.value);
        break;
      case 4:
        if (event.target.value === 8) {
          const l = new Date();
          this.day$.set(l.getDay().toString());
        } else {
          this.day$.set(event.target.value);
        }
        break;
    }
  }

  ngOnInit() {
    // Get the user's location and tablet ID.
    this.setCurrentLocation();

    // Retrieve the 8 nearby places corresponding to the device ID.
    this.businessList$ = this.promoterService.retrieveDevicePromotion();

    this.selectedBusiness$.pipe(
      tap(a => console.log("Selected Business", a)),
    ).subscribe();
  }

  home() {
    this.router.navigate(['/home']);
  }

  openGPSSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.Location,
      optionIOS: IOSSettings.LocationServices,
    });
  }

  openBusinessMenu(business: Business) {
    this.selectedBusiness$.next(business);
    this.showBusiness$.next(true);
  }

  async checkPermission() {
    // check if user already granted permission
    let status;
    try {
      status = await Geolocation.checkPermissions();
    } catch (e) {
      const c = confirm('Please enable your GPS. Enable now?');
      if (c) {
        this.openGPSSettings();
        return false;
      } else {
        return false;
      }
    }

    if (status.location === 'granted') {
      // user granted permission
      return true;
    }

    if (status.location === 'denied') {
      // user denied permission
      return false;
    }

    // user has not been requested this permission before
    // it is advised to show the user some sort of prompt
    // this way you will not waste your only chance to ask for the permission
    const c = confirm(
      'SpotBie uses your location to provide you with products, services, features, and events based on their location.'
    );
    if (!c) {
      return false;
    }

    const permissionGranted = await Geolocation.requestPermissions();

    // user did not grant the permission, so he must have declined the request
    if (!permissionGranted) {
      return false;
    } else {
      return true;
    }
  }

  private async setCurrentLocation() {
    if (Capacitor.isNativePlatform()) {
      const hasPermissions = await this.checkPermission();

      if (hasPermissions) {
        let businessPosition: {
          coords: { latitude: number; longitude: number }
        } = await Geolocation.getCurrentPosition();
        console.log("business position", businessPosition);
        this.location$.next(businessPosition);
      }
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        let businessPosition: any = position;
        console.log("business position", businessPosition);
        this.location$.next(businessPosition);
      });
    }
  }

  promoteIt() {
    this.router.navigate(['/promoter']);
  }

  selectBusiness() {
    this.showBusiness$.next(false);
  }

  closeRewardMenu() {
    this.showBusiness$.next(false);
    this.selectedBusiness$.next(null);
  }

  protected readonly console = console;
}
