import {
  AfterViewInit,
  Component,
  Inject,
  Injector,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SpotbiePipesModule} from '../../../spotbie-pipes/spotbie-pipes.module';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {UserauthService} from '../../../services/userauth.service';
import {User} from '../../../models/user';
import {environment} from '../../../../environments/environment';
import GeocoderResult = google.maps.GeocoderResult;
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  faCheckCircle,
  faLocationArrow,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {HelperModule} from '../../../helpers/helper.module';
import {BehaviorSubject, combineLatest} from "rxjs";
import {filter, tap} from "rxjs/operators";
import {Capacitor} from "@capacitor/core";
import {Geolocation} from "@capacitor/geolocation";
import {AndroidSettings, IOSSettings, NativeSettings} from "capacitor-native-settings";

const MAX_DISTANCE = 80467;

declare const google: any;
@Component({
  selector: 'app-food-truck-location',
  templateUrl: './food-truck-location-dialog.component.html',
  styleUrls: ['./food-truck-location-dialog.component.css'],
  imports: [
    CommonModule,
    SpotbiePipesModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HelperModule,
  ],
  standalone: true,
})
export class FoodTruckLocationDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('addressSearch') addressSearch;
  @ViewChild('foodTruckWindow') foodTruckWindow;

  // The map HTML container.
  spotbieMap: google.maps.Map;

  // The marker for the logged-in user.
  myMarker: google.maps.Marker;

  locationFound$= new BehaviorSubject<boolean>(false);
  city$ = new BehaviorSubject<string>(null);
  country$ = new BehaviorSubject<string>(null);
  line1$ = new BehaviorSubject<string>(null);
  line2$ = new BehaviorSubject<string>(null);
  postalCode$ = new BehaviorSubject<string>(null);
  state$ = new BehaviorSubject<string>(null);
  originPhoto$ = new BehaviorSubject<string>('../../assets/images/home_imgs/find-places-to-eat.svg');
  lat$ = new BehaviorSubject<number>(null);
  lng$ = new BehaviorSubject<number>(null);
  zoom$ = new BehaviorSubject<number>(16);
  businessSettingsForm: UntypedFormGroup = null;
  addressResults$ = new BehaviorSubject<any[]>(null);
  user: User;
  loading$ = new BehaviorSubject<boolean>(false);
  businessSettingsFormUp$ = new BehaviorSubject<boolean>(false);
  geoCoder: any;
  place$ = new BehaviorSubject<any>(null);
  address$ = new BehaviorSubject<string>(null);
  businessFormSubmitted$ = new BehaviorSubject<boolean>(false);
  originTitle$ = new BehaviorSubject<string>(null);
  faSearchLocation = faLocationArrow;
  faCheckCircle = faCheckCircle;
  locationSavedSuccessfully$ = new BehaviorSubject<boolean>(false);
  locationSavedSuccessfullyMessage$ = new BehaviorSubject<string>(null);
  displayLocationEnablingInstructions$ = new BehaviorSubject<boolean>(false);
  map$ = new BehaviorSubject<boolean>(true);

  constructor(
    private userService: UserauthService,
    private injector: Injector,
    private ngZone: NgZone,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<FoodTruckLocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.user = this.userService.userProfile;
    this.originTitle$.next(this.userService.userProfile.business.name);

    combineLatest([this.lat$, this.lng$])
      .pipe(
        filter(([lat, lng]) => !!lat && !!lng),
        tap(([lat, lng]) => {
          if (this.spotbieMap) {
            this.spotbieMap.setCenter({lat, lng});
          }

          // Delete myMarker from the map if it exists
          if (this.myMarker) {
            this.myMarker.setMap(null);
          }

          this.myMarker = new google.maps.Marker({
            position: {lat, lng},
            map: this.spotbieMap,
          });

          this.loading$.next(false);
        })
      ).subscribe();
  }

  ngAfterViewInit() {
    this.initSettingsForm();
  }

  ngOnInit(): void {}

  saveLocation() {
    this.loading$.next(true);

    const businessInfo = {
      address: this.originAddress,
      city: this.city$.getValue(),
      country: this.country$.getValue(),
      line1: this.line1$.getValue(),
      line2: this.line2$.getValue(),
      postal_code: this.postalCode$.getValue(),
      state: this.state$.getValue(),
      photo: this.originPhoto$.getValue(),
      loc_x: this.lat$.getValue(),
      loc_y: this.lng$.getValue(),
    };

    this.businessFormSubmitted$.next(true);

    this.userService.saveLocation(businessInfo).subscribe(resp => {
      if (resp.success) {
        this.locationSavedSuccessfully$.next(true);
        this.locationSavedSuccessfullyMessage$.next('LOCATION UPDATED SUCCESSFULLY');
        this.foodTruckWindow.nativeElement.scrollTo(0, 0);
      } else {
        this.locationSavedSuccessfully$.next(false);
        this.locationSavedSuccessfullyMessage$.next('There was a problem saving location. Try again.');
      }

      this.loading$.next(false);
    });

    if (this.businessSettingsForm.invalid) {
      this.loading$.next(false);
      return;
    }

    this.loading$.next(false);
  }

  getMapClass() {
    return 'spotbie-agm-map sb-map-results-open';
  }

  get originAddress() {
    return this.businessSettingsForm.get('originAddress').value;
  }

  get spotbieOrigin() {
    return this.businessSettingsForm.get('spotbieOrigin').value;
  }

  get i() {
    return this.businessSettingsForm.controls;
  }

  focusPlace(place) {
    this.loading$.next(true);
    this.place$.next(place);
    this.locationFound$.next(false);
    this.getPlaceDetails();
  }

  async getPlaceDetails() {
    const ngZone = this.injector.get(NgZone);

    const request = {
      placeId: this.place$.getValue().place_id,
      fields: ['name', 'photo', 'geometry', 'adr_address', 'formatted_address'],
    };

    const {PlacesService} = await google.maps.importLibrary("places");

    const map: HTMLDivElement = document.getElementById('settings-map') as HTMLDivElement;
    const placesService = new PlacesService(this.spotbieMap);

    placesService.getDetails(request, (place, status) => {
      ngZone.run(() => {
        this.place$.next(place);
        this.lat$.next(place.geometry.location.lat());
        this.lng$.next(place.geometry.location.lng());
        this.zoom$.next(18);

        this.getAddress(this.lat$.getValue(), this.lng$.getValue());

        this.businessSettingsForm
          .get('spotbieOrigin')
          .setValue(this.lat$.getValue() + ',' + this.lng$.getValue());

        this.businessSettingsForm
          .get('originAddress')
          .setValue(place.formatted_address);

        this.locationFound$.next(true);

        this.originPhoto$.next('../../assets/images/home_imgs/find-places-to-eat.svg');

        this.loading$.next(false);
      });
    });

    this.addressResults$.next([]);
  }

  getBusinessImgStyle() {
    if (this.originPhoto$.getValue() === null) return;

    if (this.originPhoto$.getValue().includes('home_imgs')) {
      return 'sb-originPhoto-sm';
    } else {
      return 'sb-originPhoto-lg';
    }
  }

  searchMapsKeyDown(evt) {
    if (evt.key === 'Enter') {
      this.searchMaps();
    }
  }

  async searchMaps() {
    const inputAddress = this.addressSearch.nativeElement;

    const {AutocompleteService} = await google.maps.importLibrary("places");
    let service = new AutocompleteService();

    const location = new google.maps.LatLng(this.lat$.getValue(), this.lng$.getValue());

    service.getQueryPredictions(
      {
        input: inputAddress.value,
        componentRestrictions: {country: 'us'},
        radius: MAX_DISTANCE,
        location,
        types: ['establishment'],
      },
      (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        const filteredPredictions = [];

        for (const item of predictions) {
          if (item.place_id !== null && item.place_id !== undefined) {
            filteredPredictions.push(item);
          }
        }

        this.ngZone.run(() => {
          this.addressResults$.next(filteredPredictions);
        });
      }
    );
  }

  async initSettingsForm() {
    this.businessSettingsForm = this.formBuilder.group({
      originAddress: ['', [Validators.required]],
      spotbieOrigin: ['', [Validators.required]],
    });

    this.businessSettingsForm
      .get('originAddress')
      .setValue(this.user.business.address);

    this.businessSettingsForm
      .get('spotbieOrigin')
      .setValue(`${this.user.business.loc_x},${this.user.business.loc_y}`);

    const position = {
      coords: {
        latitude: this.user.business.loc_x,
        longitude: this.user.business.loc_y,
      },
    };

    await this.initMap();

    this.showPosition(position, true);

    this.businessSettingsFormUp$.next(true);
  }

  showPosition(position: any, override = false) {
    this.locationFound$.next(true);

    if (environment.fakeLocation && !override) {
      this.lat$.next(environment.myLocX);
      this.lng$.next(environment.myLocY);
    } else {
      this.lat$.next(position.coords.latitude);
      this.lng$.next(position.coords.longitude);
    }
  }

  async setAsCurrentLocation() {
    this.loading$.next(true);

    if (Capacitor.isNativePlatform()) {
      const hasPermissions = await this.checkPermission();

      if (hasPermissions) {
        let businessPosition: { coords: { latitude: number; longitude: number } } = await Geolocation.getCurrentPosition();

        if (environment.fakeLocation) {
          this.lat$.next(environment.myLocX);
          this.lng$.next(environment.myLocY);
        } else {
          this.lat$.next(businessPosition.coords.latitude);
          this.lng$.next(businessPosition.coords.longitude);
        }

        this.zoom$.next(18);
        this.locationFound$.next(true);

        this.getAddress(this.lat$.getValue(), this.lng$.getValue());
      } else {
        this.showMapError();
        return;
      }
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        if (environment.fakeLocation && !this.user.business) {
          this.lat$.next(environment.myLocX);
          this.lng$.next(environment.myLocY);
        } else {
          this.lat$.next(position.coords.latitude);
          this.lng$.next(position.coords.longitude);
        }

        this.zoom$.next(18);
        this.locationFound$.next(true);

        this.getAddress(this.lat$.getValue(), this.lng$.getValue());
      });
    }
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

  showMapError() {
    // Check for location permission and prompt the user.
    alert("Please enable location to find SpotBie locations.");

    this.displayLocationEnablingInstructions$.next(true);
    this.foodTruckWindow.nativeElement.scrollTo(0, 0);
    this.loading$.next(false);
  }

  getAddressComponent(results, field) {
    for (let j = 0; j < results.address_components.length; j++) {
      for (let k = 0; k < results.address_components[j].types.length; k++) {
        if (results.address_components[j].types[k] === field) {
          return results.address_components[j].short_name;
        }
      }
    }
  }

  async getAddress(latitude, longitude) {
    this.geoCoder = new google.maps.Geocoder();

    await this.geoCoder.geocode(
      {location: {lat: latitude, lng: longitude}},
      (results: GeocoderResult, status) => {
        if (status === 'OK') {

          if (results[0]) {
            this.zoom$.next(18);
            this.address$.next(results[0].formatted_address);
            this.city$.next(this.getAddressComponent(results[0], 'locality'));

            this.line1$.next(
              results[0].address_components[0].long_name +
              ' ' +
              results[0].address_components[1].long_name);

            this.state$.next(this.getAddressComponent(
              results[0],
              'administrative_area_level_1'
            ));

            this.country$.next(this.getAddressComponent(results[0], 'country'));

            this.postalCode$.next(this.getAddressComponent(
              results[0],
              'postal_code'
            ));

            this.businessSettingsForm
              .get('originAddress')
              .setValue(this.address$.getValue());

            this.businessSettingsForm
              .get('spotbieOrigin')
              .setValue(this.lat$.getValue() + ',' + this.lng$.getValue());

            this.loading$.next(false);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      }
    );
  }

  getMapOptions(): any {
    return {
      //styles: this.mapStyles,
      zoom: this.zoom$.getValue(),
      clickable: false,
      mapTypeControl: false,
      streetViewControl: false,
      mapId: environment.mapId,
    };
  }

  async initMap(): Promise<void> {
    const {Map} = await google.maps.importLibrary('maps');

    const mapOptions = this.getMapOptions();
    try {
      this.spotbieMap = new Map(
        document.getElementById('settings-map') as HTMLElement,
        mapOptions
      );
    } catch (e) {
      console.log(
        'YOUR ERROR', e,
        document.getElementById('settings-map') as HTMLElement,
        this.businessSettingsFormUp$.getValue(),
        this.businessSettingsForm
      );
    }
  }

  openAppSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  openGPSSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.Location,
      optionIOS: IOSSettings.LocationServices,
    });
  }

  close() {
    this.dialogRef.close(null);
  }
}
