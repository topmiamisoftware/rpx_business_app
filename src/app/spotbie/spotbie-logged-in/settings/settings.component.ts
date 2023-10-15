import {COMMA, ENTER} from '@angular/cdk/keycodes'
import {Component, OnInit, ViewChild, NgZone, ElementRef, Output, EventEmitter, Injector} from '@angular/core'
import {UntypedFormBuilder, Validators, UntypedFormGroup, UntypedFormControl} from '@angular/forms'
import * as spotbieGlobals from '../../../globals'
import {User} from '../../../models/user'
import {AgmMap, MapsAPILoader} from '@agm/core'
import {ValidatePassword} from '../../../helpers/password.validator'
import {MustMatch} from '../../../helpers/must-match.validator'
import {ValidateUsername} from 'src/app/helpers/username.validator'
import {ValidatePersonName} from 'src/app/helpers/name.validator'
import {UserauthService} from 'src/app/services/userauth.service'
import * as calendly from '../../../helpers/calendly/calendlyHelper'
import * as map_extras from 'src/app/spotbie/map/map_extras/map_extras'
import {Business} from 'src/app/models/business'
import {HttpClient, HttpEventType} from '@angular/common/http'
import {MatChipInputEvent} from '@angular/material/chips'
import {map, startWith} from 'rxjs/operators'
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete'
import {Observable} from 'rxjs/internal/Observable'
import {LocationService} from 'src/app/services/location-service/location.service'
import {environment} from 'src/environments/environment'
import {AllowedAccountTypes} from 'src/app/helpers/enum/account-type.enum'
import {SpotbiePaymentsService} from 'src/app/services/spotbie-payments/spotbie-payments.service'
import GeocoderResult = google.maps.GeocoderResult;

const PLACE_TO_EAT_API = spotbieGlobals.API + 'place-to-eat'
const PLACE_TO_EAT_MEDIA_MAX_UPLOAD_SIZE = 25e+6
const MAX_DISTANCE = 80467

declare const google: any

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @ViewChild('spotbieSettingsInfoText') spotbieSettingsInfoText: ElementRef
  @ViewChild('spotbie_password_change_info_text') spotbiePasswordInfoText: ElementRef
  @ViewChild('current_password_info') spotbieCurrentPasswordInfoText: ElementRef
  @ViewChild('spotbie_deactivation_info') spotbieAccountDeactivationInfo
  @ViewChild('addressSearch') addressSearch
  @ViewChild('userAccountTypeNormalScroll') userAccountTypeNormalScroll
  @ViewChild('spotbie_map') spotbie_map: AgmMap
  @ViewChild('spotbieSettingsWindow') spotbieSettingsWindow
  @ViewChild('placeToEatMediaUploadInfo') placeToEatMediaUploadInfo
  @ViewChild('placeToEatMediaInput') placeToEatMediaInput

  @Output() closeWindowEvt = new EventEmitter()

  lat: number
  lng: number
  zoom: number = 12
  fitBounds: boolean = false
  locationFound = false
  settingsForm: UntypedFormGroup
  businessSettingsForm: UntypedFormGroup
  originPhoto: string = '../../assets/images/home_imgs/find-places-to-eat.svg'
  passwordForm: UntypedFormGroup
  savePasswordShow: boolean = false
  deactivationForm: UntypedFormGroup
  accountDeactivation: boolean = false
  deactivationSubmitted: boolean = false
  loading = false
  accountTypePhotos = [
    '../../assets/images/home_imgs/find-users.svg',
    '../../assets/images/home_imgs/find-places-to-eat.svg',
    '../../assets/images/home_imgs/find-events.svg',
    '../../assets/images/home_imgs/find-places-for-shopping.svg'
  ]
  accountTypeList = ['PLACE TO EAT', 'RETAIL STORE']
  chosenAccountType: number
  loadAccountTypes = false
  accountTypeCategory: string
  accountTypeCategoryFriendlyName: string
  user: User
  userIsSubscribed: boolean = false
  userSubscriptionPlan: string = ''
  submitted: boolean = false
  placeFormSubmitted: boolean = false
  geoCoder: any
  address: any
  addressResults: any
  passwordSubmitted: boolean = false
  settingsFormInitiated: boolean = false
  mapStyles = map_extras.MAP_STYLES
  locationPrompt: boolean = true
  showMobilePrompt: boolean = false
  showMobilePrompt2: boolean = false
  placeSettingsFormUp: boolean = false
  place: any
  claimBusiness: boolean = false
  passKeyVerificationFormUp: boolean = false
  passKeyVerificationForm: UntypedFormGroup
  passKeyVerificationSubmitted: boolean = false
  businessVerified: boolean = false
  placeToEatMediaMessage: string
  placeToEatMediaUploadProgress: number = 0
  customPatterns = {
    0: {pattern: new RegExp('\[0-9\]')},
    A: {pattern: new RegExp('\[A-Z\]')}
  }
  calendlyUp: boolean = false
  businessCategoryList: Array<string> = []
  selectable = true
  removable = true
  separatorKeysCodes: number[] = [ENTER, COMMA]
  filteredBusinessCategories: Observable<string[]>
  activeBusinessCategories: string[] = []
  city: string = null
  country: string = null
  line1: string = null
  line2: string = null
  postalCode: string = null
  state: string = null
  friendlyCategories: string = null
  isSocialAccount: boolean = false

  @ViewChild('businessInput') businessInput: ElementRef<HTMLInputElement>

  constructor(private http: HttpClient,
              private formBuilder: UntypedFormBuilder,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              private userAuthService: UserauthService,
              private locationService: LocationService,
              private injector: Injector,
              private paymentService: SpotbiePaymentsService) {
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim()

    // Add our category
    if (value) this.activeBusinessCategories.push(value)
    this.businessSettingsForm.get('originCategories').setValue(null)
  }

  remove(category: string): void {
    const index = this.activeBusinessCategories.indexOf(category)

    if (index >= 0) this.activeBusinessCategories.splice(index, 1)

    this.businessSettingsForm.get('originCategories').setValue(null)
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.activeBusinessCategories.indexOf(event.option.viewValue) > -1) return

    this.activeBusinessCategories.push(event.option.viewValue)
    this.businessInput.nativeElement.value = ''

    this.businessSettingsForm.get('originCategories').setValue(null)
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase()
    return this.activeBusinessCategories.filter(category => category.toLowerCase().includes(filterValue))
  }

  private fetchCurrentSettings(): any {
    this.userAuthService.getSettings().subscribe(resp => {
        this.populateSettings(resp)
      }, error => {
        console.log('Error', error)
      })
  }

  cancelPlaceSettings() {
    this.placeSettingsFormUp = false
  }

  cancelMembership() {
    const r = confirm(`
            Are you sure you want to delete your subscription? All yours IN-HOUSE Promotions will also be deleted.
        `)

    if (r) {
      this.paymentService.cancelBusinessMembership().subscribe(
        resp => {
          window.location.reload()
        })
    }
  }

  private populateSettings(settingsResponse: any) {
    if (settingsResponse.success) {
      this.user = settingsResponse.user
      this.user.spotbie_user = settingsResponse.spotbie_user
      this.user.uuid = settingsResponse.user.hash
      this.userIsSubscribed = settingsResponse.is_subscribed;
      this.user.ends_at = settingsResponse.ends_at;
      this.user.next_payment = settingsResponse.next_payment;
      this.userSubscriptionPlan = settingsResponse.userSubscriptionPlan;

      console.log('THE USER', this.user);

      if (this.user.spotbie_user.user_type === AllowedAccountTypes.Unset && !this.settingsFormInitiated) {
        this.loadAccountTypes = true
      }

      this.chosenAccountType = this.user.spotbie_user.user_type

      switch (this.chosenAccountType) {
        case AllowedAccountTypes.PlaceToEat:
          this.accountTypeCategory = 'PLACE TO EAT'
          this.accountTypeCategoryFriendlyName = 'PLACE TO EAT'
          break
        case AllowedAccountTypes.Events:
          this.accountTypeCategory = 'EVENTS'
          this.accountTypeCategoryFriendlyName = 'EVENTS BUSINESS'
          break
        case AllowedAccountTypes.Shopping:
          this.accountTypeCategory = 'RETAIL STORE'
          this.accountTypeCategoryFriendlyName = 'RETAIL STORE'
          break
        case AllowedAccountTypes.Personal:
        case AllowedAccountTypes.Unset:
          this.accountTypeCategory = 'PERSONAL'
          this.accountTypeCategoryFriendlyName = 'PERSONAL'
          break
      }

      this.settingsFormInitiated = true

      this.settingsForm.get('spotbie_username').setValue(this.user.username)
      this.settingsForm.get('spotbie_first_name').setValue(this.user.spotbie_user.first_name)
      this.settingsForm.get('spotbie_last_name').setValue(this.user.spotbie_user.last_name)
      this.settingsForm.get('spotbie_email').setValue(this.user.email)
      this.settingsForm.get('spotbie_phone_number').setValue(this.user.spotbie_user.phone_number)
      this.passwordForm.get('spotbie_password').setValue('userpassword')
      this.passwordForm.get('spotbie_confirm_password').setValue('123456789')

      if ((this.chosenAccountType === AllowedAccountTypes.PlaceToEat ||
          this.chosenAccountType === AllowedAccountTypes.Shopping ||
          this.chosenAccountType === AllowedAccountTypes.Events)
        && settingsResponse.business !== null) {

        this.settingsForm.get('spotbie_acc_type').setValue(this.accountTypeCategory)

        this.user.business = new Business()
        this.user.business.loc_x = settingsResponse.business.loc_x
        this.user.business.loc_y = settingsResponse.business.loc_y
        this.user.business.name = settingsResponse.business.name
        this.user.business.description = settingsResponse.business.description
        this.user.business.address = settingsResponse.business.address
        this.user.business.photo = settingsResponse.business.photo

        this.originPhoto = this.user.business.photo
      }

    } else {
      console.log('Settings Error: ', settingsResponse)
    }
    this.loading = false
  }

  get passKey() {
    return this.passKeyVerificationForm.get('passKey').value
  }

  get j() {
    return this.passKeyVerificationForm.controls
  }

  startBusinessVerification() {
    this.loading = true
    this.placeFormSubmitted = true

    const numberCategories = []

    this.activeBusinessCategories.forEach(element => {
      const categoryIndex = this.businessCategoryList.indexOf(element)
      if (categoryIndex > 0) numberCategories.push(categoryIndex)
    })

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
      loc_x: this.lat,
      loc_y: this.lng,
      categories: JSON.stringify(numberCategories),
    }

    this.userAuthService.saveBusiness(businessInfo).subscribe()

    if (this.businessSettingsForm.invalid) {
      this.loading = false
      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0)
      return
    }

    const passKeyValidators = [Validators.required, Validators.minLength(4)]

    this.passKeyVerificationForm = this.formBuilder.group({
      passKey: ['', passKeyValidators]
    })

    this.passKeyVerificationFormUp = true
    this.loading = false
  }

  activateFullMembership(ca: number) {
    switch (ca) {
      case 2:
        window.open(`${environment.baseUrl}make-payment/business-membership-1/${this.user.uuid}`, '_blank')
        break;
      case 3:
        window.open(`${environment.baseUrl}make-payment/business-membership-2/${this.user.uuid}`, '_blank')
        break;
      case 1:
        window.open(`${environment.baseUrl}make-payment/business-membership/${this.user.uuid}`, '_blank')
        break;
    }
  }

  closePassKey() {
    this.passKeyVerificationForm = null
    this.passKeyVerificationFormUp = false
  }

  calendly(): void {
    this.loading = true
    this.calendlyUp = !this.calendlyUp

    if (this.calendlyUp)
      calendly.spawnCalendly(this.originTitle, this.originAddress, () => {
        this.loading = false
      })
    else {
      this.loading = false
    }
  }

  claimThisBusiness() {
    this.loading = true
    this.passKeyVerificationSubmitted = true

    if (this.passKeyVerificationForm.invalid) {
      this.loading = false
      return
    }

    const numberCategories = []

    this.activeBusinessCategories.forEach(element => {
      const categoryIndex = this.businessCategoryList.indexOf(element)
      if (categoryIndex > 0) numberCategories.push(categoryIndex)
    })

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
      loc_x: this.lat,
      loc_y: this.lng,
      categories: JSON.stringify(numberCategories),
      passkey: this.passKey
    }

    this.userAuthService.verifyBusiness(businessInfo).subscribe(
      (resp) => {
        this.claimThisBusinessCB(resp)
      })
  }

  private claimThisBusinessCB(resp: any) {
    if (resp.message === 'passkey_mismatch') {
      this.passKeyVerificationForm.get('passKey').setErrors({invalid: true})
    } else if (resp.message === 'success') {
      this.passKeyVerificationSubmitted = false
      this.passKeyVerificationForm = null
      this.passKeyVerificationFormUp = false

      localStorage.setItem('spotbie_userType', this.chosenAccountType.toString())

      this.businessVerified = true

      setTimeout(() => {
        window.location.reload()
      }, 500)
    }

    this.loading = false
  }

  claimWithGoogle() {
    const businessInfo = {
      accountType: this.chosenAccountType
    }

    this.userAuthService.verifyBusiness(businessInfo).subscribe((resp) => {
        this.claimThisBusinessCB(resp)
      })
  }

  openWindow(window: any) {
    window.open = true
  }

  searchMapsKeyDown(evt) {
    if (evt.key === 'Enter') this.searchMaps()
  }

  searchMaps() {
    const inputAddress = this.addressSearch.nativeElement
    const service = new google.maps.places.AutocompleteService()
    const location = new google.maps.LatLng(this.lat, this.lng)

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
        this.addressResults = filteredPredictions
      })
    })
  }

  focusPlace(place) {
    this.loading = true
    this.place = place
    this.locationFound = false
    this.getPlaceDetails()
  }

  getPlaceDetails() {
    const ngZone = this.injector.get(NgZone);

    const request = {
      placeId: this.place.place_id,
      fields: ['name', 'photo', 'geometry', 'adr_address', 'formatted_address'],
    }

    const map: HTMLDivElement = document.getElementById('spotbieMapG') as HTMLDivElement
    const mapService = new google.maps.places.PlacesService(map)

    mapService.getDetails(request, (place, status) => {
      ngZone.run(() => {
        this.place = place
        this.lat = place.geometry.location.lat()
        this.lng = place.geometry.location.lng()
        this.zoom = 18

        if(this.user.business){
          this.businessSettingsForm.get('spotbieOrigin').setValue(this.user.business.loc_y + ',' + this.user.business.loc_y)
          this.businessSettingsForm.get('originTitle').setValue(this.user.business.name)
          this.businessSettingsForm.get('originAddress').setValue(this.user.business.address)
        } else {
          this.businessSettingsForm.get('spotbieOrigin').setValue(this.lat + ',' + this.lng)
          this.businessSettingsForm.get('originTitle').setValue(place.name)
          this.businessSettingsForm.get('originAddress').setValue(place.formatted_address)
        }

        this.locationFound = true
        this.claimBusiness = true

        if (place.photos) {
          this.originPhoto = place.photos[0].getUrl();
        } else {
          this.originPhoto = '../../assets/images/home_imgs/find-places-to-eat.svg'
        }

        this.loading = false
      })
    })
    this.addressResults = []
  }

  getBusinessImgStyle() {
    if (this.originPhoto === null) return

    if (this.originPhoto.includes('home_imgs'))
      return 'sb-originPhoto-sm'
    else
      return 'sb-originPhoto-lg'
  }

  startRewardMediaUploader(): void {
    this.placeToEatMediaInput.nativeElement.click()
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

    this.loading = true
    const formData = new FormData()

    let fileToUpload
    let uploadSize = 0

    for (let i = 0; i < fileListLength; i++) {
      fileToUpload = files[i] as File
      uploadSize += fileToUpload.size

      if (uploadSize > PLACE_TO_EAT_MEDIA_MAX_UPLOAD_SIZE) {
        this.placeToEatMediaMessage = 'Max upload size is 25MB.'
        this.loading = false
        return
      }
      formData.append('background_picture', fileToUpload, fileToUpload.name)
    }

    const endPoint = `${PLACE_TO_EAT_API}/upload-photo`

    this.http.post(endPoint, formData, {reportProgress: true, observe: 'events'}).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress)
        this.placeToEatMediaUploadProgress = Math.round(100 * event.loaded / event.total)
      else if (event.type === HttpEventType.Response)
        this.placeToEatMediaUploadFinished(event.body)
    })

    return
  }

  private placeToEatMediaUploadFinished(httpResponse: any): void {
    if (httpResponse.success)
      this.originPhoto = httpResponse.background_picture
    else
      console.log('placeToEatMediaUploadFinished', httpResponse)

    this.loading = false
  }

  mapsAutocomplete() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder()
      const inputAddress = this.addressSearch.nativeElement
      const autocomplete = new google.maps.places.Autocomplete(inputAddress, {
        componentRestrictions: {country: 'us', distance_meters: MAX_DISTANCE},
        types: ['establishment']
      })

      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place: any = autocomplete.getPlace()
          // verify result
          if (place.geometry === undefined || place.geometry === null) return

          // set latitude, longitude and zoom
          this.lat = place.geometry.location.lat()
          this.lng = place.geometry.location.lng()
          this.zoom = 18
        })
      })
    })
  }

  promptForLocation() {
    this.locationPrompt = false

    if (localStorage.getItem('spotbie_locationPrompted') === '1') {
      this.startLocation()
    } else {
      this.locationPrompt = true
    }
  }

  acceptLocationPrompt() {
    this.locationPrompt = false
    localStorage.setItem('spotbie_locationPrompted', '0')
    this.startLocation()
  }

  mobilePrompt2Toggle() {
    this.loading = false
    this.showMobilePrompt2 = false
  }

  mobilePrompt2ToggleOff() {
    this.loading = false
    this.showMobilePrompt2 = false
  }

  mobileStartLocation() {
    this.setCurrentLocation()
    this.showMobilePrompt = false
    this.showMobilePrompt2 = true
  }

  startLocation() {
    this.showMobilePrompt = true
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (environment.fakeLocation && !this.user.business) {
          this.lat = environment.myLocX
          this.lng = environment.myLocY
        } else {
          if(this.user.business){
            this.lat = this.user.business.loc_x
            this.lng = this.user.business.loc_y
          } else {
            this.lat = position.coords.latitude
            this.lng = position.coords.longitude
          }
        }

        this.zoom = 18
        this.locationFound = true
        this.getAddress(this.lat, this.lng)
      })
    }
  }

  markerDragEnd($event) {
    console.log($event)
    this.lat = $event.coords.lat
    this.lng = $event.coords.lng
    this.getAddress(this.lat, this.lng)
  }

  getAddressCompoenent(results, field){
    for(let j=0;j < results.address_components.length; j++){
      for(let k=0; k < results.address_components[j].types.length; k++){
        if(results.address_components[j].types[k] === field){
          return results.address_components[j].short_name;
        }
      }
    }
  }

  async getAddress(latitude, longitude) {
    await this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder()
    })

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

          this.businessSettingsForm.get('originAddress').setValue(this.address)
          this.businessSettingsForm.get('spotbieOrigin').setValue(this.lat + ',' + this.lng)
        } else {
          window.alert('No results found')
        }
      } else {
        window.alert('Geocoder failed due to: ' + status)
      }
    })
  }

  showPosition(position: any, override: boolean = false) {
    this.locationFound = true
    if (environment.fakeLocation && !override) {
      this.lat = environment.myLocX
      this.lng = environment.myLocY
    } else {
      this.lat = position.coords.latitude
      this.lng = position.coords.longitude
    }

    this.showMobilePrompt2 = false
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
  }

  completeSavePassword(): void {

    if (this.loading) return

    this.loading = true

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
            this.password_submitted = false
            this.save_password = false
          }.bind(this), 2000)
          break
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

    this.loading = false
  }

  cancelPasswordSet() {
    this.passwordSubmitted = false
    this.savePasswordShow = false
  }

  changeAccType() {
    this.loadAccountTypes = true
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
        this.mobileStartLocation()
        break
      case 'EVENTS':
        this.chosenAccountType = AllowedAccountTypes.Events
        this.originPhoto = this.accountTypePhotos[2]
        this.accountTypeCategoryFriendlyName = 'EVENTS BUSINESS'
        this.mobileStartLocation()
        break
      case 'RETAIL STORE':
        this.chosenAccountType = AllowedAccountTypes.Shopping
        this.originPhoto = this.accountTypePhotos[3]
        this.accountTypeCategoryFriendlyName = 'RETAIL STORE'
        this.mobileStartLocation()
        break
    }

    this.settingsForm.get('spotbie_acc_type').setValue(this.accountTypeCategory)

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

    this.loadAccountTypes = false
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

    const userType = parseInt(localStorage.getItem('spotbie_userType'), 10)

    if (userType !== AllowedAccountTypes.Personal)
      settingsFormInputObj.spotbie_acc_type = ['', accountTypeValidators]

    switch (action) {
      case 'personal':
        this.settingsForm = this.formBuilder.group(settingsFormInputObj, {
          validators: [ValidateUsername('spotbie_username'),
            ValidatePersonName('spotbie_first_name'),
            ValidatePersonName('spotbie_last_name')]
        })
        this.passwordForm = this.formBuilder.group({
          spotbie_password: ['', passwordValidators],
          spotbie_confirm_password: ['', passwordConfirmValidators]
        }, {
          validators: [ValidatePassword('spotbie_password'),
            MustMatch('spotbie_password', 'spotbie_confirm_password')]
        })
        this.accountTypeCategory = 'PERSONAL'
        this.fetchCurrentSettings()
        break

      case 'events':
      case 'shopping':
      case 'place_to_eat':
        const originTitleValidators = [Validators.required, Validators.maxLength(25)]
        const originAddressValidators = [Validators.required]
        const originValidators = [Validators.required]
        const originDescriptionValidators = [Validators.required, Validators.maxLength(350), Validators.minLength(100)]

        this.businessSettingsForm = this.formBuilder.group({
          originAddress: ['', originAddressValidators],
          originTitle: ['', originTitleValidators],
          originDescription: ['', originDescriptionValidators],
          spotbieOrigin: ['', originValidators],
          originCategories: ['']
        })

        if (this.user.business) {
          console.log(this.user.business);
          this.businessSettingsForm.get('originAddress').setValue(this.user.business.address)
          this.businessSettingsForm.get('spotbieOrigin').setValue(`${this.user.business.loc_x},${this.user.business.loc_y}`)
          const position = {
            coords: {latitude: this.user.business.loc_x, longitude: this.user.business.loc_y}
          }
          this.showPosition(position, true)
          this.originPhoto = this.user.business.photo
          this.businessSettingsForm.get('originDescription').setValue(this.user.business.description)
          this.businessSettingsForm.get('originTitle').setValue(this.user.business.name)
        } else {
          this.businessSettingsForm.get('originAddress').setValue('SEARCH FOR LOCATION')
          this.businessSettingsForm.get('spotbieOrigin').setValue(this.lat + ',' + this.lng)
        }

        this.filteredBusinessCategories = this.businessSettingsForm.get('originCategories').valueChanges.pipe(
          startWith(null),
          map((fruit: string | null) => fruit ? this._filter(fruit) : this.businessCategoryList.slice())
        )

        this.placeSettingsFormUp = true

        switch (action) {
          case 'events':
            this.accountTypeCategory = 'EVENTS'
            this.accountTypeCategoryFriendlyName = 'EVENTS BUSINESS'
            await this.classificationSearch().subscribe(resp => {
                this.classificationSearchCallback(resp)}
            )
            break;
          case 'place_to_eat':
            this.accountTypeCategory = 'PLACE TO EAT'
            this.accountTypeCategoryFriendlyName = 'PLACE TO EAT'
            this.businessCategoryList = map_extras.FOOD_CATEGORIES
            break;
          case 'shopping':
            this.accountTypeCategory = 'RETAIL STORE'
            this.accountTypeCategoryFriendlyName = 'RETAIL STORE'
            this.businessCategoryList = map_extras.SHOPPING_CATEGORIES
            break;
        }
        this.businessSettingsForm.get('spotbie_acc_type').setValue(this.accountTypeCategory);
        break
    }
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

  get deactivationPassword() { return this.deactivationForm.get('spotbie_deactivation_password').value}
  get h() { return this.deactivationForm.controls }

  get originAddress() { return this.businessSettingsForm.get('originAddress').value }
  get spotbieOrigin() { return this.businessSettingsForm.get('spotbieOrigin').value }
  get originTitle() { return this.businessSettingsForm.get('originTitle').value }
  get originDescription() { return this.businessSettingsForm.get('originDescription').value }
  get originCategories() { return this.businessSettingsForm.get('originCategories').value}
  get i() { return this.businessSettingsForm.controls }

  saveSettings() {
    this.loading = true
    this.submitted = true

    if (this.settingsForm.invalid) {
      this.loading = false
      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0)
      return
    }

    this.user.username = this.username
    this.user.email = this.email
    this.user.spotbie_user.first_name = this.first_name
    this.user.spotbie_user.last_name = this.last_name
    this.user.spotbie_user.phone_number = this.spotbie_phone_number
    this.user.spotbie_user.user_type = this.chosenAccountType

    this.userAuthService.saveSettings(this.user).subscribe({ next: (resp) => {
        this.saveSettingsCallback(resp)
      },  error: (error: any) => {
        if (error.error.errors.email[0] === 'notUnique') {
          this.settingsForm.get('spotbie_email').setErrors({notUnique: true})
        }
        this.spotbieSettingsInfoText.nativeElement.innerHTML = `
            <span class='spotbie-text-gradient spotbie-error'>
                There was an error saving.
            </span>
        `
        this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0)
        this.loading = false
        this.placeSettingsFormUp = false
      }
    })
  }

  private saveSettingsCallback(resp: any) {
    this.loading = false
    this.placeSettingsFormUp = false

    if (resp.success) {
      this.spotbieSettingsInfoText.nativeElement.innerHTML = `
                <span class='sb-text-light-green-gradient'>
                Your settings were saved.
                </span>
            `

      this.spotbieSettingsWindow.nativeElement.scrollTo(0, 0)

      localStorage.setItem('spotbie_userLogin', resp.user.username)
      localStorage.setItem('spotbie_userType', resp.user.spotbie_user.user_type)
    } else {
      this.spotbieSettingsInfoText.nativeElement.innerHTML = `
                <span class='spotbie-text-gradient spotbie-error'>
                    There was an error saving.
                </span>
            `
    }
  }

  cancelDeactivateAccount() {
    this.accountDeactivation = false
  }

  startDeactivateAccount(): void {
    this.accountDeactivation = true

    const socialId = localStorage.getItem('spotbiecom_social_id')

    if (socialId != null && socialId !== undefined && socialId.length > 0) {
      this.isSocialAccount = true
    } else {
      this.isSocialAccount = false
    }

    if (!this.isSocialAccount) {
      const deactivationPasswordValidator = [Validators.required]

      this.deactivationForm = this.formBuilder.group({
        spotbie_deactivation_password: ['', deactivationPasswordValidator]
      })

      this.deactivationForm.get('spotbie_deactivation_password').setValue('123456789')
    }
  }

  deactivateAccount() {
    const r = confirm('Are you sure you want to deactivate your account?')

    if (!r) return
    if (this.loading) return

    this.loading = true

    let deactivationPassword = null

    if (!this.isSocialAccount) {
      if (this.deactivationForm.invalid) {
        this.spotbieAccountDeactivationInfo.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'})
        return
      }
      deactivationPassword = this.deactivationPassword
    }

    this.userAuthService.deactivateAccount(deactivationPassword, this.isSocialAccount).subscribe(
      resp => {
        this.deactivateCallback(resp)
      })
  }

  private deactivateCallback(resp: any) {
    this.loading = false
    if (resp.success) {
    } else {
      console.log('deactivateCallback', resp)
    }
  }

  closeWindow() {
    window.location.reload()
  }

  classificationSearch(): Observable<any> {
    this.loading = true
    return this.locationService.getClassifications()
  }

  classificationSearchCallback(resp) {
    this.loading = false

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

    this.loading = false
  }

  ngOnInit(): void {
    this.loading = true
    this.initSettingsForm('personal')
  }
}
