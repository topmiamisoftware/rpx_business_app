import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import * as spotbieGlobals from '../../../globals'
import {BusinessMembership, User} from '../../../models/user'
import {ValidatePassword} from '../../../helpers/password.validator'
import {MustMatch} from '../../../helpers/must-match.validator'
import {ValidateUsername} from '../../../helpers/username.validator'
import {ValidatePersonName} from '../../../helpers/name.validator'
import {UserauthService} from '../../../services/userauth.service'
import * as map_extras from '../../../spotbie/map/map_extras/map_extras'
import {Business} from '../../../models/business'
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable'
import {LocationService} from '../../../services/location-service/location.service'
import {environment} from '../../../../environments/environment'
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum'
import {BehaviorSubject, combineLatest, of} from "rxjs";
import {Preferences} from "@capacitor/preferences";
import GeocoderResult = google.maps.GeocoderResult;
import {Capacitor} from "@capacitor/core";
import {Geolocation} from "@capacitor/geolocation";
import {AndroidSettings, IOSSettings, NativeSettings} from "capacitor-native-settings";
import {filter, tap} from "rxjs/operators";
import {AlertDialogComponent} from "../../../helpers/alert/alert.component";
import {MatDialog} from "@angular/material/dialog";
import {faTruck} from "@fortawesome/free-solid-svg-icons";
import {SpotbiePaymentsService} from "../../../services/spotbie-payments/spotbie-payments.service";

const PLACE_TO_EAT_API = spotbieGlobals.API + 'place-to-eat';
const PLACE_TO_EAT_MEDIA_MAX_UPLOAD_SIZE = 25e+6;
const MAX_DISTANCE = 80467;

declare const google: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnChanges {

  @ViewChild('spotbieSettingsInfoText') spotbieSettingsInfoText: ElementRef
  @ViewChild('spotbie_password_change_info_text') spotbiePasswordInfoText: ElementRef
  @ViewChild('current_password_info') spotbieCurrentPasswordInfoText: ElementRef
  @ViewChild('addressSearch') addressSearch
  @ViewChild('userAccountTypeNormalScroll') userAccountTypeNormalScroll

  @ViewChild('spotbieSettingsWindow') spotbieSettingsWindow;
  // @ViewChild('placeToEatMediaUploadInfo') placeToEatMediaUploadInfo;
  // @ViewChild('placeToEatMediaInput') placeToEatMediaInput;

  @Output() closeWindowEvt = new EventEmitter();

  // The map HTML container.
  spotbieMap: google.maps.Map;

  // The marker for the logged-in user.
  myMarker: google.maps.Marker;

  lat$ = new BehaviorSubject<number>(null);
  lng$= new BehaviorSubject<number>(null);

  faFoodTruckIcon = faTruck;

  zoom: number = 18;
  locationFound = false;
  settingsForm: UntypedFormGroup;
  businessSettingsForm: UntypedFormGroup;
  originPhoto: string = '../../assets/images/home_imgs/find-places-to-eat.svg';
  passwordForm: UntypedFormGroup;
  savePasswordShow: boolean = false;
  loading$ = new BehaviorSubject<boolean>(false);
  accountTypePhotos = [
    '../../assets/images/home_imgs/find-users.svg',
    '../../assets/images/home_imgs/find-places-to-eat.svg',
    '../../assets/images/home_imgs/find-events.svg',
    '../../assets/images/home_imgs/find-places-for-shopping.svg'
  ];
  accountTypeList = ['PLACE TO EAT', 'RETAIL STORE'];
  chosenAccountType: number;
  loadAccountTypes = false;
  accountTypeCategory: string;
  accountTypeCategoryFriendlyName: string;
  user: User;
  selected: number;
  userIsSubscribed: boolean = false;
  userSubscriptionPlan: BusinessMembership;
  _businessMembership = BusinessMembership;
  submitted: boolean = false;
  placeFormSubmitted: boolean = false;
  geoCoder: any;
  address: any;
  addressResults: any;
  passwordSubmitted: boolean = false;
  settingsFormInitiated: boolean = false;
  placeSettingsFormUp: boolean = false;
  place: any;
  claimBusiness: boolean = false;
  passKeyVerificationFormUp: boolean = false;
  passKeyVerificationForm: UntypedFormGroup;
  passKeyVerificationSubmitted: boolean = false;
  businessVerified: boolean = false;
  placeToEatMediaMessage: string;
  placeToEatMediaUploadProgress: number = 0
  businessCategoryList: Array<string> = [];
  activeBusinessCategories: string;
  city: string = null;
  country: string = null;
  line1: string = null;
  line2: string = null;
  postalCode: string = null;
  state: string = null;
  map$ = new BehaviorSubject<boolean>(true);
  displayLocationEnablingInstructions$ = new BehaviorSubject<boolean>(false);

  @ViewChild('businessInput') businessInput: ElementRef<HTMLInputElement>

  constructor(private http: HttpClient,
              private formBuilder: UntypedFormBuilder,
              private ngZone: NgZone,
              private userAuthService: UserauthService,
              private locationService: LocationService,
              private injector: Injector,
              private changeDetectionRef: ChangeDetectorRef,
              public dialog: MatDialog,
              private paymentService: SpotbiePaymentsService,
  ) {

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

  ngOnInit(): void {
    this.loading$.next(true);
    this.initSettingsForm('personal');
  }

  ngOnChanges() {
    this.changeDetectionRef.markForCheck();
  }

  private fetchCurrentSettings(): any {
    this.userAuthService.getSettings().subscribe(resp => {
      this.populateSettings(resp);
    }, error => {
      console.log('Error', error);
    });
  }

  private populateSettings(settingsResponse: any) {
    if (settingsResponse.success) {
      this.user = settingsResponse.user;
      this.user.spotbie_user = settingsResponse.spotbie_user;
      this.user.uuid = settingsResponse.user.hash;
      this.userIsSubscribed = settingsResponse.is_subscribed;
      this.user.ends_at = settingsResponse.ends_at;
      this.user.next_payment = settingsResponse.next_payment;
      this.userSubscriptionPlan = settingsResponse.userSubscriptionPlan;

      if (this.user.spotbie_user.user_type === AllowedAccountTypes.Unset && !this.settingsFormInitiated) {
        this.loadAccountTypes = true;
      }

      this.chosenAccountType = this.user.spotbie_user.user_type;

      switch (this.chosenAccountType) {
        case AllowedAccountTypes.PlaceToEat:
          this.accountTypeCategory = 'PLACE TO EAT';
          this.accountTypeCategoryFriendlyName = 'PLACE TO EAT';
          break;
        case AllowedAccountTypes.Events:
          this.accountTypeCategory = 'EVENTS';
          this.accountTypeCategoryFriendlyName = 'EVENTS BUSINESS';
          break;
        case AllowedAccountTypes.Shopping:
          this.accountTypeCategory = 'RETAIL STORE';
          this.accountTypeCategoryFriendlyName = 'RETAIL STORE';
          break;
        case AllowedAccountTypes.Personal:
        case AllowedAccountTypes.Unset:
          this.accountTypeCategory = 'PERSONAL';
          this.accountTypeCategoryFriendlyName = 'PERSONAL';
          break;
      }

      this.settingsFormInitiated = true;

      this.settingsForm.get('spotbie_username').setValue(this.user.username)
      this.settingsForm.get('spotbie_first_name').setValue(this.user.spotbie_user.first_name)
      this.settingsForm.get('spotbie_last_name').setValue(this.user.spotbie_user.last_name)
      this.settingsForm.get('spotbie_email').setValue(this.user.email)
      this.settingsForm.get('spotbie_phone_number')
        .setValue(this.user.spotbie_user.phone_number?.replace('+1', ''));
      this.passwordForm.get('spotbie_password').setValue('userpassword')
      this.passwordForm.get('spotbie_confirm_password').setValue('123456789')

      if ((this.chosenAccountType === AllowedAccountTypes.PlaceToEat ||
          this.chosenAccountType === AllowedAccountTypes.Shopping ||
          this.chosenAccountType === AllowedAccountTypes.Events)
        && settingsResponse.business !== null) {

        this.settingsForm.get('spotbie_acc_type').setValue(this.accountTypeCategory);

        this.user.business = new Business()
        this.user.business.loc_x = settingsResponse.business.loc_x;
        this.user.business.loc_y = settingsResponse.business.loc_y;
        this.user.business.name = settingsResponse.business.name;
        this.user.business.description = settingsResponse.business.description;
        this.user.business.address = settingsResponse.business.address;
        this.user.business.photo = settingsResponse.business.photo;
        this.user.business.categories = settingsResponse.business.categories;
        this.user.business.is_food_truck = settingsResponse.business.is_food_truck;

        this.originPhoto = this.user.business.photo;
      }
    } else {
      console.log('Settings Error: ', settingsResponse);
    }

    this.loading$.next(false);

    this.changeDetectionRef.detectChanges();
  }

  add(event): void {
    this.activeBusinessCategories = event.detail.value;
    this.businessSettingsForm.get('originCategories').setValue(event.detail.value);
  }

  cancelPlaceSettings() {
    this.placeSettingsFormUp = false;
  }

  closeAccountType() {
    this.loadAccountTypes = false;
  }

  get passKey() {
    return this.passKeyVerificationForm.get('passKey').value;
  }

  get j() {
    return this.passKeyVerificationForm.controls;
  }

  startBusinessVerification() {
    this.loading$.next(true);
    this.placeFormSubmitted = true;

    const businessInfo = {
      accountType: this.chosenAccountType,
      name: this.originTitle,
      description: this.originDescription,
      address: this.originAddress,
      city: this.city,
      country: this.country,
      line1: this.line1,
      line2: this.line2,
      postal_code: this.postalCode,
      state: this.state,
      photo: this.originPhoto,
      loc_x: this.lat$.getValue(),
      loc_y: this.lng$.getValue(),
      categories: this.activeBusinessCategories.toString(),
      is_food_truck: Boolean(this.isFoodTruck),
    };

    this.userAuthService.saveBusiness(businessInfo).subscribe();

    if (this.businessSettingsForm.invalid) {
      this.loading$.next(false);
      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0);
      return;
    }

    const passKeyValidators = [Validators.required, Validators.minLength(4)]

    this.passKeyVerificationForm = this.formBuilder.group({
      passKey: ['', passKeyValidators]
    });

    this.passKeyVerificationFormUp = true;
    this.loading$.next(false);

    this.changeDetectionRef.detectChanges();
  }

  closePassKey() {
    this.passKeyVerificationForm = null;
    this.passKeyVerificationFormUp = false;
    this.changeDetectionRef.detectChanges();
  }

  claimThisBusiness() {
    this.loading$.next(true);
    this.passKeyVerificationSubmitted = true;

    if (this.passKeyVerificationForm.invalid) {
      this.loading$.next(false);
      return;
    }

    const businessInfo = {
      accountType: this.chosenAccountType,
      name: this.originTitle,
      description: this.originDescription,
      address: this.originAddress,
      city: this.city,
      country: this.country,
      line1: this.line1,
      line2: this.line2,
      postal_code: this.postalCode,
      state: this.state,
      photo: this.originPhoto,
      loc_x: this.lat$.getValue(),
      loc_y: this.lng$.getValue(),
      categories: this.activeBusinessCategories.toString(),
      passkey: this.passKey,
      is_food_truck: this.isFoodTruck
    };

    this.userAuthService.verifyBusiness(businessInfo).subscribe(
      (resp) => {
        this.claimThisBusinessCB(resp);
      });
  }

  cancelMembership() {
    const r = confirm(`
            Are you sure you want to delete your subscription? All your IN-HOUSE Promotions will also be deleted.
        `);

    if (r) {
      this.paymentService
        .cancelBusinessMembership()
        .subscribe(resp => window.location.reload());
    }
  }

  private claimThisBusinessCB(resp: any) {
    if (resp.message === 'passkey_mismatch') {
      this.passKeyVerificationForm.get('passKey').setErrors({invalid: true});
    } else if (resp.message === 'success') {
      this.passKeyVerificationSubmitted = false;
      this.passKeyVerificationForm = null;
      this.passKeyVerificationFormUp = false;

      Preferences.set({ key: 'spotbie_userType', value: this.chosenAccountType.toString()});
      this.businessVerified = true;

      this.userAuthService.getSettings();

      setTimeout(() => {
        this.closeWindow();
      }, 1500);
    }

    this.loading$.next(false);

    this.changeDetectionRef.detectChanges();
  }

  searchMapsKeyDown(evt) {
    this.myMarker.setMap(null);
    if (evt.key === 'Enter') {
      this.searchMaps();
    }
  }

  async searchMaps() {
    const inputAddress = this.addressSearch.nativeElement;
    const location = new google.maps.LatLng(this.lat$.getValue(), this.lng$.getValue());

    const {AutocompleteService} = await google.maps.importLibrary("places");

    let service = new AutocompleteService();
    service.getQueryPredictions({
      input: inputAddress.value,
      componentRestrictions: {country: 'us'},
      radius: MAX_DISTANCE,
      location,
      types: ['establishment']
    }, (predictions, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return
      }
      const filteredPredictions = []

      for (const item of predictions) {
        if (item.place_id !== null && item.place_id !== undefined) {
          filteredPredictions.push(item)
        }
      }

      this.ngZone.run(() => {
        this.addressResults = filteredPredictions;
        this.changeDetectionRef.detectChanges();
      });
    })
  }

  focusPlace(place) {
    // this.loading$.next(true);
    this.place = place;
    this.locationFound = false;

    this.changeDetectionRef.detectChanges();

    this.getPlaceDetails();
  }

  async getPlaceDetails() {
    const ngZone = this.injector.get(NgZone);

    const request = {
      placeId: this.place.place_id,
      fields: ['name', 'photo', 'geometry', 'adr_address', 'formatted_address'],
    };

    const {PlacesService} = await google.maps.importLibrary("places");

    const map: HTMLDivElement = document.getElementById('settings-map') as HTMLDivElement;
    const placesService = new PlacesService(this.spotbieMap);

    placesService.getDetails(request, (place, status) => {
      ngZone.run(async () => {
        this.place = place;

        this.zoom = 18;

        const businessPosition = {
          coords: {latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng()}
        };

        await this.setMap(businessPosition);

        this.businessSettingsForm.get('spotbieOrigin').setValue(this.lat$.getValue() + ',' + this.lng$.getValue());
        this.businessSettingsForm.get('originAddress').setValue(place.formatted_address);

        console.log("the place", place.geometry.location);

        this.getAddress(place.geometry.location.lat(), place.geometry.location.lng()).then(() => {
          this.locationFound = true;
          this.claimBusiness = true;

          if (place.photos) {
            this.originPhoto = place.photos[0].getUrl();
          } else {
            this.originPhoto = '../../assets/images/home_imgs/find-places-to-eat.svg';
          }

          this.loading$.next(false);

          this.changeDetectionRef.detectChanges();
        });
      });
    });
    this.addressResults = [];

    this.changeDetectionRef.detectChanges();
  }

  getBusinessImgStyle() {
    if (this.originPhoto === null) {
      return;
    }

    if (this.originPhoto.includes('home_imgs')) {
      return 'sb-originPhoto-sm';
    } else {
      return 'sb-originPhoto-lg';
    }
  }

  startRewardMediaUploader(): void {
    // this.placeToEatMediaInput.nativeElement.click()
  }

  uploadMedia(files): void {
    const fileListLength = files.length

    if (fileListLength === 0) {
      this.placeToEatMediaMessage = 'You must upload at least one file.'
      return
    } else if (fileListLength > 1) {
      this.placeToEatMediaMessage = 'Upload only one background image.'
      return
    }

    this.loading$.next(true);
    const formData = new FormData();

    let fileToUpload;
    let uploadSize = 0;

    for (let i = 0; i < fileListLength; i++) {
      fileToUpload = files[i] as File;
      uploadSize += fileToUpload.size;

      if (uploadSize > PLACE_TO_EAT_MEDIA_MAX_UPLOAD_SIZE) {
        this.placeToEatMediaMessage = 'Max upload size is 25MB.';
        this.loading$.next(false);
        return;
      }

      formData.append('background_picture', fileToUpload, fileToUpload.name);
    }

    const endPoint = `${PLACE_TO_EAT_API}/upload-photo`;

    this.http.post(endPoint, formData, {reportProgress: true, observe: 'events'}).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        this.placeToEatMediaUploadProgress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.placeToEatMediaUploadFinished(event.body);
      }
    });

    return;
  }

  private placeToEatMediaUploadFinished(httpResponse: any): void {
    if (httpResponse.success)
      this.originPhoto = httpResponse.background_picture
    else
      console.log('placeToEatMediaUploadFinished', httpResponse)

    this.loading$.next(false);
  }

  getMapClass() {
    return 'spotbie-agm-map sb-map-results-open';
  }

  async mobileStartLocation() {
    this.loading$.next(true);
    await this.initMap();
    this.setCurrentLocation();
    this.changeDetectionRef.detectChanges();
  }

  private async setCurrentLocation() {
    if (Capacitor.isNativePlatform()) {
      const hasPermissions = await this.checkPermission();

      if (hasPermissions) {
        let businessPosition: { coords: { latitude: number; longitude: number } } = await Geolocation.getCurrentPosition();

        if(this.user.business){
          this.lat$.next(this.user.business.loc_x);
          this.lng$.next(this.user.business.loc_y);
          businessPosition = {
            coords: {latitude: this.user.business.loc_x, longitude: this.user.business.loc_y}
          };
          await this.setMap(businessPosition).then(() => {
            this.map$.next(true);
            this.getAddress(this.lat$.getValue(), this.lng$.getValue());
          });
        } else {
          this.lat$.next(businessPosition.coords.latitude);
          this.lng$.next(businessPosition.coords.longitude);
          await this.setMap(businessPosition).then(() => {
            this.map$.next(true);
            this.getAddress(this.lat$.getValue(), this.lng$.getValue());
          });
        }
      } else {
        this.showMapError();
        return;
      }
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        let businessPosition: any = position;

        if(this.user.business){
          this.lat$.next(this.user.business.loc_x);
          this.lng$.next(this.user.business.loc_y);
          businessPosition = {
            coords: {latitude: this.user.business.loc_x, longitude: this.user.business.loc_y}
          };
        } else {
          this.lat$.next(position.coords.latitude);
          this.lng$.next(position.coords.longitude);
        }

        this.zoom = 18;
        this.locationFound = true;

        this.setMap(businessPosition).then(() => {
          this.map$.next(true);
          this.getAddress(this.lat$.getValue(), this.lng$.getValue());
        });
      });
    }
    this.changeDetectionRef.detectChanges();
  }

  async setMap(coordinates) {
    this.showPosition(coordinates);
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

  getAddressCompoenent(results, field){
    for(let j= 0; j < results.address_components.length; j++){
      for(let k= 0; k < results.address_components[j].types.length; k++){
        if(results.address_components[j].types[k] === field){
          return results.address_components[j].short_name;
        }
      }
    }
  }

  async getAddress(latitude, longitude) {
    this.geoCoder = new google.maps.Geocoder();

    await this.geoCoder.geocode({location: {lat: latitude, lng: longitude}}, (results: GeocoderResult, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 18
          this.address = results[0].formatted_address
          this.city = this.getAddressCompoenent(results[0], 'locality');
          this.line1 = results[0].address_components[0].long_name + ' ' + results[0].address_components[1].long_name
          this.state = this.getAddressCompoenent(results[0], 'administrative_area_level_1');
          this.country = this.getAddressCompoenent(results[0], 'country');
          this.postalCode = this.getAddressCompoenent(results[0], 'postal_code');

          if (!this.user.business?.address) {
            this.businessSettingsForm.get('originAddress').setValue(this.address);
          }

          this.businessSettingsForm.get('spotbieOrigin').setValue(this.lat$.getValue() + ',' + this.lng$.getValue())
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });

    this.changeDetectionRef.detectChanges();
  }

  showPosition(position: any, override: boolean = false) {
    this.locationFound = true

    this.lat$.next(position.coords.latitude);
    this.lng$.next(position.coords.longitude);

    this.changeDetectionRef.detectChanges();
  }

  savePassword(): void {
    this.spotbiePasswordInfoText.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'})

    if (this.passwordForm.invalid) {
      this.spotbiePasswordInfoText.nativeElement.style.display = 'block'
      return
    }

    if (this.password !== this.confirm_password) {
      this.spotbiePasswordInfoText.nativeElement.style.display = 'block'
      this.spotbiePasswordInfoText.nativeElement.innerHTML = 'Passwords must match.'
      return
    }

    this.spotbiePasswordInfoText.nativeElement.style.display = 'block'
    this.spotbiePasswordInfoText.nativeElement.innerHTML = 'Great, your passwords match!'
    this.savePasswordShow = true
    this.passwordForm.addControl('spotbie_current_password', new UntypedFormControl('', [Validators.required]))
    this.passwordForm.get('spotbie_current_password').setValue('123456789')
    this.changeDetectionRef.detectChanges();
  }

  completeSavePassword(): void {
    if (this.loading$.getValue() === true) return

    this.loading$.next(true);

    if (this.passwordForm.invalid) return

    const savePasswordObj = {
      password: this.password,
      passwordConfirmation: this.confirm_password,
      currentPassword: this.current_password
    }

    this.userAuthService.passwordChange(savePasswordObj).subscribe(resp => {
        this.passwordChangeCallback(resp)
      }, error => {
        console.log('error', error)
      })
  }

  private passwordChangeCallback(resp: any) {
    if (resp.success) {
      switch (resp.message) {
        case 'saved':
          this.spotbieCurrentPasswordInfoText.nativeElement.innerHTML = 'Your password was updated.'
          this.passwordForm.get('spotbie_current_password').setValue('123456789')
          this.passwordForm.get('spotbie_password').setValue('asdrqweee')
          this.passwordForm.get('spotbie_confirm_password').setValue('asdeqweqq')
          this.spotbiePasswordInfoText.nativeElement.style.display = 'block'
          this.spotbiePasswordInfoText.nativeElement.innerHTML = 'Would you like to change your password?'
          setTimeout(function () {
            this.passwordSubmitted = false
            this.savePasswordShow = false
          }.bind(this), 2000);
          break;
        case 'SB-E-000':
          // server error
          this.savePasswordShow = false
          this.passwordSubmitted = false
          this.spotbiePasswordInfoText.nativeElement.style.display = 'block'
          this.spotbiePasswordInfoText.nativeElement.innerHTML = 'There was an error with the server. Try again.'
          break
      }
      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0)
    } else
      console.log(resp)

    this.loading$.next(false);
    this.changeDetectionRef.detectChanges();
  }

  cancelPasswordSet() {
    this.passwordSubmitted = false
    this.savePasswordShow = false
    this.changeDetectionRef.detectChanges();
  }

  changeAccType() {
    this.loadAccountTypes = true
    this.changeDetectionRef.detectChanges();
  }

  selectAccountType(accountType: string) {
    this.accountTypeCategory = accountType

    switch (this.accountTypeCategory) {
      case 'PERSONAL':
        this.chosenAccountType = AllowedAccountTypes.Personal
        this.originPhoto = this.accountTypePhotos[0]
        this.accountTypeCategoryFriendlyName = 'PERSONAL'
        break
      case 'PLACE TO EAT':
        this.chosenAccountType = AllowedAccountTypes.PlaceToEat
        this.originPhoto = this.accountTypePhotos[1]
        this.accountTypeCategoryFriendlyName = 'PLACE TO EAT'
        break
      case 'EVENTS':
        this.chosenAccountType = AllowedAccountTypes.Events
        this.originPhoto = this.accountTypePhotos[2]
        this.accountTypeCategoryFriendlyName = 'EVENTS BUSINESS'
        break
      case 'RETAIL STORE':
        this.chosenAccountType = AllowedAccountTypes.Shopping;
        this.originPhoto = this.accountTypePhotos[3];
        this.accountTypeCategoryFriendlyName = 'RETAIL STORE';
        break
    }

    this.settingsForm.get('spotbie_acc_type').setValue(this.accountTypeCategory);

    switch (this.chosenAccountType) {
      case AllowedAccountTypes.Personal:
        this.initSettingsForm('personal')
        break
      case AllowedAccountTypes.PlaceToEat:
        this.initSettingsForm('place_to_eat')
        break
      case AllowedAccountTypes.Events:
        this.initSettingsForm('events')
        break
      case AllowedAccountTypes.Shopping:
        this.initSettingsForm('shopping')
        break
      default:
        this.initSettingsForm('personal')
    }

    this.loadAccountTypes = false;
    this.changeDetectionRef.detectChanges();
  }

  private async initSettingsForm(action: string) {
    const usernameValidators = [Validators.required, Validators.maxLength(135)]
    const firstNameValidators = [Validators.required, Validators.maxLength(72)]
    const lastNameValidators = [Validators.required, Validators.maxLength(72)]
    const emailValidators = [Validators.email, Validators.required, Validators.maxLength(135)]
    const phoneValidators = []
    const accountTypeValidators = [Validators.required]
    const passwordValidators = [Validators.required]
    const passwordConfirmValidators = [Validators.required]
    const settingsFormInputObj: any =
      {
        spotbie_username: ['', usernameValidators],
        spotbie_first_name: ['', firstNameValidators],
        spotbie_last_name: ['', lastNameValidators],
        spotbie_email: ['', emailValidators],
        spotbie_phone_number: ['', phoneValidators]
      }

      let userType: any = (await Preferences.get({key: 'spotbie_userType'})).value;
      userType = parseInt(userType, 10);

    if (userType !== AllowedAccountTypes.Personal) {
      settingsFormInputObj.spotbie_acc_type = ['', accountTypeValidators]
    }

    switch (action) {
      case 'personal':
        this.settingsForm = this.formBuilder.group(settingsFormInputObj, {
          validators: [ValidateUsername('spotbie_username'),
            ValidatePersonName('spotbie_first_name'),
            ValidatePersonName('spotbie_last_name')]
        });
        this.passwordForm = this.formBuilder.group({
          spotbie_password: ['', passwordValidators],
          spotbie_confirm_password: ['', passwordConfirmValidators]
        }, {
          validators: [ValidatePassword('spotbie_password'),
            MustMatch('spotbie_password', 'spotbie_confirm_password')]
        });
        this.accountTypeCategory = 'PERSONAL';
        this.fetchCurrentSettings();
        break;

      case 'events':
      case 'shopping':
      case 'place_to_eat':
        const originTitleValidators = [Validators.required, Validators.maxLength(25)];
        const originAddressValidators = [Validators.required];
        const originValidators = [Validators.required];
        const originDescriptionValidators = [Validators.required, Validators.maxLength(350), Validators.minLength(100)];

        this.businessSettingsForm = this.formBuilder.group({
          originAddress: ['', originAddressValidators],
          originTitle: ['', originTitleValidators],
          originDescription: ['', originDescriptionValidators],
          spotbieOrigin: ['', originValidators],
          isFoodTruck: [''],
          originCategories: [''],
          spotbiePhoneNumber: ['', phoneValidators],
        });

        if (this.user.business) {
          this.businessSettingsForm.get('originAddress').setValue(this.user.business.address);
          this.businessSettingsForm.get('spotbieOrigin').setValue(`${this.user.business.loc_x},${this.user.business.loc_y}`);
          this.originPhoto = this.user.business.photo;
          this.businessSettingsForm.get('originDescription').setValue(this.user.business.description);
          this.businessSettingsForm.get('originTitle').setValue(this.user.business.name);
          this.businessSettingsForm
            .get('isFoodTruck')
            .setValue(!!this.user.business.is_food_truck);
          this.activeBusinessCategories = this.user.business.categories.toString();
        } else {
          this.businessSettingsForm.get('originAddress').setValue('SEARCH FOR LOCATION');
          this.businessSettingsForm.get('spotbieOrigin').setValue(this.lat$.getValue() + ',' + this.lng$.getValue());
        }

        this.placeSettingsFormUp = true;

        switch (action) {
          case 'events':
            this.accountTypeCategory = 'EVENTS';
            this.accountTypeCategoryFriendlyName = 'EVENTS BUSINESS';
            await this.classificationSearch().subscribe(resp => {
                this.classificationSearchCallback(resp);
            });
            break;
          case 'place_to_eat':
            this.accountTypeCategory = 'PLACE TO EAT';
            this.accountTypeCategoryFriendlyName = 'PLACE TO EAT';
            this.businessCategoryList = map_extras.FOOD_CATEGORIES;
            this.selected = parseInt(this.activeBusinessCategories);
            break;
          case 'shopping':
            this.accountTypeCategory = 'RETAIL STORE';
            this.accountTypeCategoryFriendlyName = 'RETAIL STORE';
            this.businessCategoryList = map_extras.SHOPPING_CATEGORIES;
            this.selected = parseInt(this.activeBusinessCategories);
            break;
        }

        this.businessSettingsForm.get('originCategories').setValue(this.selected);

        this.mobileStartLocation();
        break;
    }

    this.changeDetectionRef.detectChanges();
  }

  get username() { return this.settingsForm.get('spotbie_username').value }
  get first_name() { return this.settingsForm.get('spotbie_first_name').value }
  get last_name() { return this.settingsForm.get('spotbie_last_name').value }
  get email() { return this.settingsForm.get('spotbie_email').value }
  get spotbie_phone_number() { return this.settingsForm.get('spotbie_phone_number').value }
  get account_type() { return this.settingsForm.get('spotbie_acc_type').value }
  get f() { return this.settingsForm.controls }

  get password() { return this.passwordForm.get('spotbie_password').value }
  get confirm_password() { return this.passwordForm.get('spotbie_confirm_password').value }
  get current_password() { return this.passwordForm.get('spotbie_current_password').value }
  get g() { return this.passwordForm.controls }

  get originAddress() { return this.businessSettingsForm.get('originAddress').value }
  get spotbieOrigin() { return this.businessSettingsForm.get('spotbieOrigin').value }
  get originTitle() { return this.businessSettingsForm.get('originTitle').value }
  get originDescription() { return this.businessSettingsForm.get('originDescription').value }
  get originCategories() { return this.businessSettingsForm.get('originCategories').value}
  get isFoodTruck() { return this.businessSettingsForm.get('isFoodTruck').value ?? false; }
  get i() { return this.businessSettingsForm.controls }

  saveSettings() {
    this.loading$.next(true);
    this.submitted = true;

    if (this.settingsForm.invalid) {
      this.loading$.next(false);
      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0);
      return;
    }

    if (this.spotbie_phone_number !== '' && this.spotbie_phone_number) {
      this.infoSms();
    } else {
      this.finishSaveSettings();
    }
  }

  private finishSaveSettings() {
    this.user.username = this.username;
    this.user.email = this.email;
    this.user.spotbie_user.first_name = this.first_name;
    this.user.spotbie_user.last_name = this.last_name;
    this.user.spotbie_user.phone_number = '+1'+this.spotbie_phone_number;
    this.user.spotbie_user.user_type = this.chosenAccountType;

    this.userAuthService.saveSettings(this.user).subscribe({ next: (resp) => {
        this.saveSettingsCallback(resp);
      },  error: (error: any) => {
        let message = '';
        if (error.error?.errors?.email && error.error?.errors?.email[0] === 'notUnique') {
          this.settingsForm.get('spotbie_email').setErrors({notUnique: true});
          message = 'E-mail already in use.';
        }

        if (error.error?.errors?.phone_number && error.error?.errors?.phone_number[0] === 'notUnique') {
          this.settingsForm.get('spotbie_phone_number').setErrors({notUnique: true});
          message = 'Phone already in use.';
        }

        this.spotbieSettingsInfoText.nativeElement.innerHTML = `
            <span class='spotbie-text-gradient spotbie-error'>
                ${message}
            </span>
        `;
        this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0);
        this.loading$.next(false);
        this.placeSettingsFormUp = false;
      }
    });
  }

  infoSms() {
    const d = this.dialog.open(AlertDialogComponent, {
      data: {
        alertText: `By providing your phone number in the settings form you are agreeing 
                    to receive recurring promotional and personalized text messages (e.g. promotions going on at
                    restaurants) from SpotBie Community Members at the phone number you are providing in this settings form.
                    Consent is not a condition to use other features in the SpotBie Platform. Reply HELP for help and STOP
                    to stop receiving text messages once you consent. Msg. frequency varies. Msg and data rates may apply.`,
        link: 'https://spotbie.com/terms',
        linkText: 'View Terms & Conditions'
      },
    });

    d.afterClosed().subscribe((result: {continueWithAction: boolean}) => {
      if (!result.continueWithAction) {
        this.loading$.next(false);
        return;
      }

      this.finishSaveSettings();
    });
  }

  async saveSettingsCallback(resp: any) {
    this.loading$.next(false);
    this.placeSettingsFormUp = false;

    if (resp.success) {
      this.spotbieSettingsInfoText.nativeElement.innerHTML = `
                <span class='sb-text-light-green-gradient'>
                Your settings were saved.
                </span>
            `;

      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0);

      Preferences.set({key: 'spotbie_userLogin', value: resp.user.username});
      Preferences.set({key: 'spotbie_userType', value: resp.user.spotbie_user.user_type});
    } else {
      this.spotbieSettingsInfoText.nativeElement.innerHTML = `
                <span class='spotbie-text-gradient spotbie-error'>
                    There was an error saving.
                </span>
            `;
    }
  }

  closeWindow() {
    this.closeWindowEvt.emit(null);
  }

  classificationSearch(): Observable<any> {
    this.loading$.next(true);
    return this.locationService.getClassifications()
  }

  classificationSearchCallback(resp) {
    this.loading$.next(false);

    if (resp.success) {
      const classifications: Array<any> = resp.data._embedded.classifications

      classifications.forEach(classification => {
        if (classification.type && classification.type.name && classification.type.name !== 'Undefined') {
          classification.name = classification.type.name
        } else if (classification.segment && classification.segment.name && classification.segment.name !== 'Undefined') {
          classification.name = classification.segment.name

          classification.segment._embedded.genres.forEach(genre => {
            genre.show_sub_sub = false

            if (genre.name === 'Chanson Francaise' ||
                genre.name === 'Medieval/Renaissance' ||
                genre.name === 'Religious' ||
                genre.name === 'Undefined' ||
                genre.name === 'World') {
              classification.segment._embedded.genres.splice(classification.segment._embedded.genres.indexOf(genre), 1)
            }
          })
        }

        if (classification.name !== undefined) {
          classification.show_sub = false

          if (classification.name !== 'Donation' &&
              classification.name !== 'Parking' &&
              classification.name !== 'Transportation' &&
              classification.name !== 'Upsell' &&
              classification.name !== 'Venue Based' &&
              classification.name !== 'Event Style' &&
              classification.name !== 'Individual' &&
              classification.name !== 'Merchandise' &&
              classification.name !== 'Group') {
            this.businessCategoryList.push(classification.name)
          }
        }
      })
      this.businessCategoryList = this.businessCategoryList.reverse()
    } else {
      console.log('getClassifications Error ', resp)
    }

    this.loading$.next(false);
    this.changeDetectionRef.detectChanges();
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
      console.log('YOUR ERROR', e, document.getElementById('settings-map') as HTMLElement, this.placeSettingsFormUp, this.businessSettingsForm);
    }
  }

  showMapError() {
    // Check for location permission and prompt the user.
    alert("Please enable location to find SpotBie locations.");

    this.displayLocationEnablingInstructions$.next(true);
    this.map$.next(false);
    this.loading$.next(false);

    this.changeDetectionRef.detectChanges();
  }

  getMapOptions(): any {
    return {
      //styles: this.mapStyles,
      zoom: this.zoom,
      clickable: false,
      mapTypeControl: false,
      streetViewControl: false,
      mapId: environment.mapId,
    };
  }

  activateFullMembership(ca: number) {
    switch (ca) {
      case 2:
        window.open(
          `${environment.baseUrl}make-payment/business-membership-1/${this.user.uuid}`,
          '_blank'
        );
        break;
      case 3:
        window.open(
          `${environment.baseUrl}make-payment/business-membership-2/${this.user.uuid}`,
          '_blank'
        );
        break;
      case 1:
        window.open(
          `${environment.baseUrl}make-payment/business-membership/${this.user.uuid}`,
          '_blank'
        );
        break;
    }
  }
}
