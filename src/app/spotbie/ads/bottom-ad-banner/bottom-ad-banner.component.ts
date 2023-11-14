import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {InfoObjectType} from '../../../helpers/enum/info-object-type.enum';
import {getDistanceFromLatLngInMiles} from '../../../helpers/measure-units.helper';
import {Ad} from '../../../models/ad';
import {Business} from '../../../models/business';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {EVENT_CATEGORIES, FOOD_CATEGORIES, SHOPPING_CATEGORIES} from '../../map/map_extras/map_extras';
import {AdsService} from '../ads.service';
import {Preferences} from "@capacitor/preferences";

const PLACE_TO_EAT_AD_IMAGE = 'assets/images/def/places-to-eat/footer_banner_in_house.jpg'
const PLACE_TO_EAT_AD_IMAGE_MOBILE = 'assets/images/def/places-to-eat/featured_banner_in_house.jpg'

const SHOPPING_AD_IMAGE = 'assets/images/def/shopping/footer_banner_in_house.jpg'
const SHOPPING_AD_IMAGE_MOBILE = 'assets/images/def/shopping/featured_banner_in_house.jpg'

const EVENTS_AD_IMAGE = 'assets/images/def/events/footer_banner_in_house.jpg'
const EVENTS_AD_IMAGE_MOBILE = 'assets/images/def/events/featured_banner_in_house.jpg'

const BOTTOM_BANNER_TIMER_INTERVAL = 16000

@Component({
  selector: 'app-bottom-ad-banner',
  templateUrl: './bottom-ad-banner.component.html',
  styleUrls: ['./bottom-ad-banner.component.css'],
})
export class BottomAdBannerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() lat: number
  @Input() lng: number
  @Input() business: Business = new Business()
  @Input() ad: Ad = null
  @Input() accountType: number = null
  @Input() categories: number
  @Input() editMode: boolean = false
  @Input() eventsClassification: number = null
  @Input() isMobile: boolean = false

  isDesktop: boolean = false
  link: string
  displayAd: boolean = false
  distance: number = 0
  totalRewards: number = 0
  categoriesListFriendly: string[] = []
  communityMemberOpen: boolean = false
  currentCategoryList: Array<string> = []
  categoryListForUi: string = null
  loyaltyPointBalance: any
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE
  genericAdImageMobile: string = PLACE_TO_EAT_AD_IMAGE_MOBILE
  switchAdInterval: any = false

  constructor(private adsService: AdsService,
              private changeDetectorRef: ChangeDetectorRef,
              private deviceDetectorService: DeviceDetectorService,
              private loyaltyPointsService: LoyaltyPointsService) {
                this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
                  this.loyaltyPointBalance = loyaltyPointBalance
                });
              }

  ngOnChanges() {
    this.changeDetectorRef.markForCheck();
  }

  async getBottomHeader(){
    let adId = null
    let accountType

    // Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton');

    if (needleElement.length > 1) {
      // There's a component on top of the bottom header.
      // I know this a rudimentary way for doing this but yeah.
      return
    }

    if (this.editMode) {
      if (this.ad == null) {
        this.ad = new Ad()
        this.ad.id = 2
        adId = this.ad.id
      } else {
        adId = this.ad.id
      }

      accountType = await Preferences.get({key: 'spotbie_userType'});
      accountType = parseInt(accountType.value, 10);

      switch(accountType){
        case 1:
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE
          this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE
          break
        case 2:
          this.genericAdImage = SHOPPING_AD_IMAGE
          this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE
          break
        case 3:
          this.genericAdImage = EVENTS_AD_IMAGE
          this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE
          this.categories = this.eventsClassification
          break
      }
    } else {
      switch(this.accountType){
        case 1:
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE
          this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE
          break
        case 2:
          this.genericAdImage = SHOPPING_AD_IMAGE
          this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE
          break
        case 3:
          this.genericAdImage = EVENTS_AD_IMAGE
          this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE
          this.categories = this.eventsClassification
          break
      }

      accountType = this.accountType;
    }

    const searchObjSb = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType
    }

    // Retrieve the SpotBie Ads
    this.adsService.getBottomHeader(searchObjSb).subscribe(
      resp => {
        this.getBottomHeaderCb(resp)
      })
  }

  getAdStyle(){
    if(this.editMode) {
      return {
        'position' : 'relative',
        'margin' : '0 auto',
        'right': '0'
      }
    }
  }

  getAdWrapperClass(){
    if(!this.isMobile) return 'spotbie-ad-wrapper-header'
    if(this.isMobile) return 'spotbie-ad-wrapper-header sb-mobileAdWrapper'
  }

  async getBottomHeaderCb(resp: any){
    if(resp.success) {
      this.ad = resp.ad
      this.business = resp.business

      if(!this.editMode && resp.business !== null) {
        switch(this.business.user_type){
          case AllowedAccountTypes.PlaceToEat:
            this.currentCategoryList = FOOD_CATEGORIES
            break
          case AllowedAccountTypes.Events:
            this.currentCategoryList = EVENT_CATEGORIES
            break
          case AllowedAccountTypes.Shopping:
            this.currentCategoryList = SHOPPING_CATEGORIES
            break
        }

        this.categoriesListFriendly = []
        this.currentCategoryList.reduce((previousValue: string, currentValue: string, currentIndex: number, array: string[]) => {

          if(resp.business.categories.indexOf(currentIndex) > -1)
            this.categoriesListFriendly.push(this.currentCategoryList[currentIndex])
          return currentValue
        })

        this.business.is_community_member = true
        this.business.type_of_info_object = InfoObjectType.SpotBieCommunity

        if(!this.editMode)
          this.distance = getDistanceFromLatLngInMiles(this.business.loc_x, this.business.loc_y, this.lat, this.lng)
        else
          this.distance = 5
      }

      this.totalRewards = resp.totalRewards
      this.displayAd = true

      this.changeDetectorRef.detectChanges();
    } else {
      if (!this.switchAdInterval) {
        this.switchAdInterval = setInterval(() => {
          if (!this.editMode) this.getBottomHeader()
        }, BOTTOM_BANNER_TIMER_INTERVAL)
      }
    }
  }

  spotbieAdWrapperStyles(){
    if(this.editMode) return { 'margin-top' : '45px' }
  }

  openAd(): void{
    if(this.business != null) {
      this.communityMemberOpen = true
    } else {
      window.open('/business', '_blank');
    }
    // this.router.navigate([`/business-menu/${this.business.qr_code_link}`])
  }

  closeRewardMenu(){
    this.communityMemberOpen = false
  }

  switchAd() {
    this.categoriesListFriendly = []
    this.categoryListForUi = null
    this.getBottomHeader()
  }

  clickGoToSponsored() {
    window.open('/business', '_blank')
  }

  updateAdImage(image: string = ''){
    if(image !== '') {
      this.ad.images = image
      this.genericAdImage = image
    }

    this.changeDetectorRef.detectChanges();
  }

  updateAdImageMobile(image: string){
    if(image !== ''){
      this.ad.images_mobile = image
      this.genericAdImageMobile = image
    }
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.isDesktop = !this.isMobile;

    this.getBottomHeader()
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    clearInterval(this.switchAdInterval)
    this.switchAdInterval = false
  }
}
