import {HttpClient, HttpEventType} from '@angular/common/http'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms'
import {Ad} from '../../../../models/ad'
import {Business} from '../../../../models/business'
import {AdCreatorService} from '../../../../services/spotbie-logged-in/ad-manager-menu/ad-creator/ad-creator.service'
import {BottomAdBannerComponent} from '../../../ads/bottom-ad-banner/bottom-ad-banner.component'
import {HeaderAdBannerComponent} from '../../../ads/header-ad-banner/header-ad-banner.component'
import {NearbyFeaturedAdComponent} from '../../../ads/nearby-featured-ad/nearby-featured-ad.component'
import * as spotbieGlobals from '../../../../globals'
import {Preferences} from "@capacitor/preferences";
import {Camera, CameraResultType, GalleryPhoto, Photo} from "@capacitor/camera";
import {AndroidSettings, IOSSettings, NativeSettings} from "capacitor-native-settings";
import {BehaviorSubject} from "rxjs";
import {Platform} from "@ionic/angular";
import { UserauthService } from '../../../../services/userauth.service'
import {BusinessMembership} from "../../../../models/user";

const AD_MEDIA_UPLOAD_API_URL = `${spotbieGlobals.API}in-house/upload-media`
const AD_MEDIA_MAX_UPLOAD_SIZE = 10e+6

interface InHouse {
  name: string;
  dimensions: string;
  dimensionsMobile?: string;
  enabled: boolean;
  type: 'header' | 'featured' | 'footer';
}

@Component({
  selector: 'app-ad-creator',
  templateUrl: './ad-creator.component.html',
  styleUrls: ['./ad-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdCreatorComponent implements OnInit, OnChanges {

  @Input() ad: Ad = null;

  @ViewChild('spbInputInfo') spbInputInfo;
  @ViewChild('adMediaInput') adMediaInput;
  @ViewChild('adMediaMobileInput') adMediaMobileInput;
  @ViewChild('spbTopAnchor') spbTopAnchor;
  @ViewChild('adApp') adApp: HeaderAdBannerComponent | BottomAdBannerComponent | NearbyFeaturedAdComponent;
  @ViewChild('adAppMobile') adAppMobile: HeaderAdBannerComponent | BottomAdBannerComponent;

  @Output() closeWindowEvt = new EventEmitter();
  @Output() closeThisEvt = new EventEmitter();
  @Output() closeAdCreatorAndRefetchAdListEvt = new EventEmitter();

  loading$ = new BehaviorSubject<boolean>(false);
  adCreatorForm: UntypedFormGroup;
  adCreatorFormUp: boolean;
  adFormSubmitted: boolean;
  showErrors: boolean;
  adUploadImage: string = null;
  adUploadImageMobile: string = null;
  adMediaMessage: string = 'Upload Image';
  adMediaUploadProgress: number = 0;
  adTypeList: InHouse[] = [
   { name: 'Header Banner', dimensions: '1200x370', dimensionsMobile: '600x600', enabled: false, type: 'header'},
   { name: 'Featured Nearby Banner', dimensions: '600x600', enabled: false, type: 'featured'},
   { name: 'Footer Banner', dimensions: '1200x370', dimensionsMobile: '600x600', enabled: false, type: 'footer'}
  ];
  adCreated$ = new BehaviorSubject<boolean>(false);
  adDeleted$ = new BehaviorSubject<boolean>(false);
  selected: number = 0;
  business: Business = null;
  $showDeniedMediaUploader = new BehaviorSubject<boolean>(false);

  constructor(private formBuilder: UntypedFormBuilder,
              private adCreatorService: AdCreatorService,
              private http: HttpClient,
              private changeDetectionRef: ChangeDetectorRef,
              private platform: Platform,
              userAuthService: UserauthService
  ) {
    // Enable the in-house ad depending on the BusinessMembership type.
    const enabledInHouse: Array<InHouse> = [];
    this.adTypeList.forEach(inHouse => {
      if (
        inHouse.type === 'footer' &&
        userAuthService.userProfile.userSubscriptionPlan ===
        BusinessMembership.Starter
      ) {
        inHouse.enabled = true;
        enabledInHouse.push(inHouse);
      }

      if (
        (inHouse.type === 'footer' ||
          inHouse.type === 'featured' ||
          inHouse.type === 'header') &&
        (userAuthService.userProfile.userSubscriptionPlan ===
          BusinessMembership.Intermediate ||
          userAuthService.userProfile.userSubscriptionPlan ===
          BusinessMembership.Ultimate ||
          userAuthService.userProfile.userSubscriptionPlan ===
          BusinessMembership.Legacy)
      ) {
        inHouse.enabled = true;
        enabledInHouse.push(inHouse);
      }
    });
    this.adTypeList = enabledInHouse;
  }

  ngOnChanges() {
    this.changeDetectionRef.markForCheck();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeThis();
    });
  }

  ngOnInit(): void {
    this.initAdForm();
  }

  get adType() {return this.adCreatorForm.get('adType').value };
  get adName() {return this.adCreatorForm.get('adName').value }
  get adDescription() {return this.adCreatorForm.get('adDescription').value }
  get adImage() {return this.adCreatorForm.get('adImage').value }

  get f() { return this.adCreatorForm.controls }

  initAdForm(){
    const adTypeValidators = [Validators.required];
    const adNameValidators = [Validators.required, Validators.maxLength(50)];
    const adDescriptionValidators = [Validators.required, Validators.maxLength(250), Validators.minLength(50)];
    const adImageValidators = [Validators.required];

    this.adCreatorForm = this.formBuilder.group({
      adType: ['', adTypeValidators],
      adName: ['', adNameValidators],
      adDescription: ['', adDescriptionValidators],
      adImage: ['', adImageValidators],
      adImageMobile: ['']
    });

    if (this.ad) {
      this.adCreatorForm.get('adType').setValue(this.ad.type);
      this.adCreatorForm.get('adName').setValue(this.ad.name);
      this.adCreatorForm.get('adDescription').setValue(this.ad.description);
      this.adCreatorForm.get('adImage').setValue(this.ad.images);
      this.adCreatorForm.get('adImageMobile').setValue(this.ad.images_mobile);

      this.adUploadImage = this.ad.images;
      this.adUploadImageMobile = this.ad.images_mobile;

      this.selected = this.ad.type;
    } else {
      this.adCreatorForm.get('adType').setValue(0);
      this.selected = 0;
    }

    this.adCreatorFormUp = true;
    this.loading$.next(false);
    this.changeDetectionRef.detectChanges();
  }

  saveAd(){
    this.adFormSubmitted = true;
    this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const adObj = new Ad();
    adObj.name = this.adName;
    adObj.description = this.adDescription;
    adObj.images = this.adUploadImage;
    adObj.images_mobile = this.adUploadImageMobile;
    adObj.type = this.adType;

    if(!this.ad){
      this.adCreatorService.saveAd(adObj).subscribe(resp => this.saveAdCb(resp));
    } else {
      adObj.id = this.ad.id;
      this.adCreatorService.updateAd(adObj).subscribe(resp => this.saveAdCb(resp));
    }
  }

  saveAdCb(resp: any){
    if (resp.success) {
      this.adCreated$.next(true);
      setTimeout(() => this.closeAdCreatorAndRefetchAdList(), 1500)
    }
  }

  startAdMediaUploader(type: string): void {
    if (this.adType === '') {
      this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.adCreatorForm.get('adType').setErrors({ required: true });
      this.showErrors = true;
      return;
    }

    Camera.checkPermissions().then((status) => {
      this.loading$.next(true);

      if (status.photos === 'granted'){
        this.adMediaUploaders(type);
      } else {
        Camera.requestPermissions({permissions: ['photos']}).then(status => {
          if (status.photos === 'granted') {
           this.adMediaUploaders(type);
          } else if (status.photos === 'denied') {
           this.showDeniedMediaUploader();
          }
        });
      }
    });
  }

  convertToBlob(image: Photo) {
    const rawData = atob(image.base64String);
    const bytes = new Array(rawData.length);
    for (var x = 0; x < rawData.length; x++) {
      bytes[x] = rawData.charCodeAt(x);
    }
    const arr = new Uint8Array(bytes);
    return new Blob([arr], {type: 'image/png'});
  }

  openAppSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  showDeniedMediaUploader() {
    this.$showDeniedMediaUploader.next(true);
  }

  async adMediaUploaders(type: string) {
    this.$showDeniedMediaUploader.next(false);
    const result = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    }).finally(() => this.loading$.next(false));

    return this.uploadMedia(result, type);
  }

  async uploadMedia(file: Photo, type: string): Promise<void> {
    const formData = new FormData();

    let fileToUpload;
    let uploadSize = 0;

    fileToUpload = file;
    uploadSize += fileToUpload.size

    if (uploadSize > AD_MEDIA_MAX_UPLOAD_SIZE) {
      this.adMediaMessage = 'Max upload size is 10MB.'
      this.loading$.next(false);
      return;
    }

    let fileName = new Date().toDateString();
    formData.append('image', this.convertToBlob(fileToUpload), fileName);

    const token = await Preferences.get({key: 'spotbiecom_session'});

    this.http.post(AD_MEDIA_UPLOAD_API_URL, formData,
        {
          reportProgress: true,
          observe: 'events',
          headers: {
            'Authorization' : `Bearer ${token}`
          }}).subscribe(event => {
            if (event.type === HttpEventType.UploadProgress) {
              this.adMediaUploadProgress = Math.round(100 * event.loaded / event.total)
            } else if (event.type === HttpEventType.Response){
              this.adMediaUploadFinished(event.body, type)
            }
          });

    this.changeDetectionRef.detectChanges();
    return;
  }

  private adMediaUploadFinished(httpResponse: any, type: string): void {
    if (httpResponse.success) {
      if (type === 'desktop') {
        this.adUploadImage = httpResponse.image;
        this.adCreatorForm.get('adImage').setValue(this.adUploadImage);
        this.adApp.updateAdImage(this.adUploadImage);
      }

      if (type === 'mobile' || this.adType === 1) {
        this.adUploadImageMobile = httpResponse.image;
        this.adCreatorForm.get('adImageMobile').setValue(this.adUploadImageMobile);

        if(this.adType === 1) {
          this.adApp.updateAdImage(this.adUploadImageMobile);
        } else if (this.adAppMobile) {
          this.adAppMobile.updateAdImageMobile(this.adUploadImageMobile);
        }
      }

      this.loading$.next(false);
    } else {
      console.log('adMediaUploadFinished', httpResponse);
      this.loading$.next(false);
    }

    this.changeDetectionRef.detectChanges();
  }

  adTypeChange(){
    this.adCreatorForm.get('adType').setErrors(null);
    this.showErrors = false;

    if(this.adUploadImage) {
      this.adApp.updateAdImage(this.adUploadImage);
    }

    if(this.adUploadImageMobile !== null && this.adAppMobile){
      this.adAppMobile.updateAdImageMobile(this.adUploadImageMobile);
    }

    this.changeDetectionRef.detectChanges();
  }

  closeThis(){
    this.closeThisEvt.emit();
  }

  closeWindow(){
    this.closeWindowEvt.emit();
  }

  closeAdCreatorAndRefetchAdList(){
    this.closeAdCreatorAndRefetchAdListEvt.emit();
  }

  deleteMe(){
    const r = confirm('Are you sure you want to delete this Ad?');

    if (r) {
      this.adCreatorService.deleteMe(this.ad).subscribe(resp => this.deleteMeCb(resp));
    }
  }

  private deleteMeCb(resp){
    if(resp.success) {
      this.adDeleted$.next(true);
      setTimeout(() => {
        this.closeAdCreatorAndRefetchAdList();
      }, 1500);
    }
  }
}
