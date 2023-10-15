import { HttpClient, HttpEventType } from '@angular/common/http'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { Ad } from 'src/app/models/ad'
import { Business } from 'src/app/models/business'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import { AdCreatorService } from 'src/app/services/spotbie-logged-in/ad-manager-menu/ad-creator/ad-creator.service'
import { BottomAdBannerComponent } from 'src/app/spotbie/ads/bottom-ad-banner/bottom-ad-banner.component'
import { HeaderAdBannerComponent } from 'src/app/spotbie/ads/header-ad-banner/header-ad-banner.component'
import { NearbyFeaturedAdComponent } from 'src/app/spotbie/ads/nearby-featured-ad/nearby-featured-ad.component'
import { environment } from 'src/environments/environment'
import * as spotbieGlobals from '../../../../globals'

const AD_MEDIA_UPLOAD_API_URL = `${spotbieGlobals.API}in-house/upload-media`
const AD_MEDIA_MAX_UPLOAD_SIZE = 10e+6
const AD_PAYMENT_URL = `${environment.baseUrl}make-payment/in-house/`

@Component({
  selector: 'app-ad-creator',
  templateUrl: './ad-creator.component.html',
  styleUrls: ['./ad-creator.component.css']
})
export class AdCreatorComponent implements OnInit {

  @Input() ad: Ad = null

  @ViewChild('spbInputInfo') spbInputInfo
  @ViewChild('adMediaInput') adMediaInput
  @ViewChild('adMediaMobileInput') adMediaMobileInput
  @ViewChild('spbTopAnchor') spbTopAnchor
  @ViewChild('adApp') adApp: HeaderAdBannerComponent | BottomAdBannerComponent | NearbyFeaturedAdComponent
  @ViewChild('adAppMobile') adAppMobile: HeaderAdBannerComponent | BottomAdBannerComponent

  @Output() closeWindowEvt = new EventEmitter()
  @Output() closeThisEvt = new EventEmitter()
  @Output() closeAdCreatorAndRefetchAdListEvt = new EventEmitter()

   loading: boolean
   adCreatorForm: UntypedFormGroup
   adCreatorFormUp: boolean
   adFormSubmitted: boolean
   showErrors: boolean
   adUploadImage: string = null
   adUploadImageMobile: string = null
   adMediaMessage: string = 'Upload Image'
   adMediaUploadProgress: number = 0
   adTypeList: Array<any> = [
    { name: 'Header Banner ($19.99/monthly)', dimensions: '1200x370', dimensionsMobile: '600x600'},
    { name: 'Featured Nearby Banner ($13.99/monthly)', dimensions: '600x600'},
    { name: 'Footer Banner ($16.99)', dimensions: '1200x370', dimensionsMobile: '600x600'}
  ]
   adCreated: boolean
   adDeleted: boolean
   loyaltyPointBalance: any
   selected: number = 0
   business: Business = null

  constructor(private formBuilder: UntypedFormBuilder,
              private adCreatorService: AdCreatorService,
              private http: HttpClient,
              private loyaltyPointsService: LoyaltyPointsService) {
          this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
            this.loyaltyPointBalance = loyaltyPointBalance
          })
  }

  get adType() {return this.adCreatorForm.get('adType').value }
  get adName() {return this.adCreatorForm.get('adName').value }
  get adDescription() {return this.adCreatorForm.get('adDescription').value }
  get adImage() {return this.adCreatorForm.get('adImage').value }

  get f() { return this.adCreatorForm.controls }

   initAdForm(){
    const adTypeValidators = [Validators.required]
    const adNameValidators = [Validators.required, Validators.maxLength(50)]
    const adDescriptionValidators = [Validators.required, Validators.maxLength(250), Validators.minLength(50)]
    const adImageValidators = [Validators.required]

    this.adCreatorForm = this.formBuilder.group({
      adType: ['', adTypeValidators],
      adName: ['', adNameValidators],
      adDescription: ['', adDescriptionValidators],
      adImage: ['', adImageValidators],
      adImageMobile: ['']
    })

    if(this.ad !== null && this.ad !== undefined){
      this.adCreatorForm.get('adType').setValue(this.ad.type)
      this.adCreatorForm.get('adName').setValue(this.ad.name)
      this.adCreatorForm.get('adDescription').setValue(this.ad.description)
      this.adCreatorForm.get('adImage').setValue(this.ad.images)
      this.adCreatorForm.get('adImageMobile').setValue(this.ad.images_mobile)

      this.adUploadImage = this.ad.images
      this.adUploadImageMobile = this.ad.images_mobile

      this.selected = this.ad.type
    } else {
      this.selected = 0
    }

    this.adCreatorFormUp = true
    this.loading = false
  }

   saveAd(){
    this.adFormSubmitted = true
    this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const adObj = new Ad()
    adObj.name = this.adName
    adObj.description = this.adDescription
    adObj.images = this.adUploadImage
    adObj.images_mobile = this.adUploadImageMobile
    adObj.type = this.adType

    if(this.ad === null || this.ad === undefined){
      this.adCreatorService.saveAd(adObj).subscribe(
        resp =>{
          this.saveAdCb(resp)
        })
    } else {
      adObj.id = this.ad.id
      this.adCreatorService.updateAd(adObj).subscribe(resp => {
          this.saveAdCb(resp)
        })
    }
  }

   saveAdCb(resp: any){
    if(resp.success){
      this.adCreated = true
      const ad = resp.newAd

      setTimeout(() => {
        window.open(`${AD_PAYMENT_URL}${ad.uuid}`, '_blank')
        this.closeAdCreatorAndRefetchAdList()
      }, 1500)
    }
  }

   startAdMediaUploader(type: string): void {
    console.log('adType', this.adType);
    if (this.adType === '') {
      this.spbTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.adCreatorForm.get('adType').setErrors({ required: true });
      this.showErrors = true;
      return;
    }
    if (type === 'mobile') {
      this.adMediaMobileInput.nativeElement.click()
    } else {
      this.adMediaInput.nativeElement.click()
    }
  }

   uploadMedia(files, type: string): void {
    const fileListLength = files.length

    if (fileListLength === 0) {
      this.adMediaMessage = 'Upload at least one image.'
      return
    } else if (fileListLength > 1) {
      this.adMediaMessage = 'Upload only one image.'
      return
    }

    this.loading = true

    const formData = new FormData()

    let fileToUpload
    let uploadSize = 0

    for (let i = 0; i < fileListLength; i++) {
      fileToUpload = files[i] as File
      uploadSize += fileToUpload.size

      if (uploadSize > AD_MEDIA_MAX_UPLOAD_SIZE) {
        this.adMediaMessage = 'Max upload size is 10MB.'
        this.loading = false
        return
      }
      formData.append('image', fileToUpload, fileToUpload.name)
    }

    const token = localStorage.getItem('spotbiecom_session')
    this.http.post(AD_MEDIA_UPLOAD_API_URL, formData,
        {
          reportProgress: true,
          observe: 'events',
          withCredentials: true, headers: {
            'Authorization' : `Bearer ${token}`
          }}).subscribe(event => {
            if (event.type === HttpEventType.UploadProgress) {
              this.adMediaUploadProgress = Math.round(100 * event.loaded / event.total)
            } else if (event.type === HttpEventType.Response){
              this.adMediaUploadFinished(event.body, type)
            }
          });
    return
  }

  private adMediaUploadFinished(httpResponse: any, type: string): void {
    if (httpResponse.success) {
      if (type === 'desktop') {
        this.adUploadImage = httpResponse.image
        this.adCreatorForm.get('adImage').setValue(this.adUploadImage)
        this.adApp.updateAdImage(this.adUploadImage)
      }
      if (type === 'mobile' || this.adType === 1) {
        this.adUploadImageMobile = httpResponse.image
        this.adCreatorForm.get('adImageMobile').setValue(this.adUploadImageMobile)
        if (this.adAppMobile) {
          this.adAppMobile.updateAdImageMobile(this.adUploadImageMobile)
        }
      }
    } else {
      console.log('adMediaUploadFinished', httpResponse);
    }
    this.loading = false;
  }

   adTypeChange(){
    this.adCreatorForm.get('adType').setErrors(null);
    this.showErrors = false;
    if(this.adUploadImage !== null) {
      this.adApp.updateAdImage(this.adUploadImage)
    }

    if(this.adUploadImageMobile !== null && this.adAppMobile){
      this.adAppMobile.updateAdImageMobile(this.adUploadImageMobile)
    }
  }

   closeThis(){
    this.closeThisEvt.emit()
  }

   closeWindow(){
    this.closeWindowEvt.emit()
  }

   closeAdCreatorAndRefetchAdList(){
    this.closeAdCreatorAndRefetchAdListEvt.emit()
  }

   deleteMe(){
    const r = confirm('Are you sure you want to delete this Ad?')

    if(r){
      this.adCreatorService.deleteMe(this.ad).subscribe(
        resp => {
          this.deleteMeCb(resp)
        })
    }
  }

  private deleteMeCb(resp){
    if(resp.success) {
      this.adDeleted = true
      setTimeout(() => {
        this.closeAdCreatorAndRefetchAdList()
      }, 1500)
    }
  }

   adFormatClass(){
    switch(this.adType){
      case 0:
        return 'header-banner'
      case 1:
        return 'related-nearby-box'
      case 2:
        return 'footer-banner'
    }
  }

   activateAdMembership(){
    window.open(`${AD_PAYMENT_URL}${this.ad.uuid}`, '_blank')
  }

  ngOnInit(): void {
    this.initAdForm()
  }
}
