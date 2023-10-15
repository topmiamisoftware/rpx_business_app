import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { AdsService } from '../ads.service';
import { Business } from 'src/app/models/business';
import { getDistanceFromLatLngInMiles } from 'src/app/helpers/measure-units.helper';
import { Ad } from 'src/app/models/ad';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FOOD_CATEGORIES, SHOPPING_CATEGORIES, EVENT_CATEGORIES } from '../../map/map_extras/map_extras';
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum';
import { InfoObjectType } from 'src/app/helpers/enum/info-object-type.enum';
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service';

const PLACE_TO_EAT_AD_IMAGE = 'assets/images/def/places-to-eat/header_banner_in_house.jpg'
const PLACE_TO_EAT_AD_IMAGE_MOBILE = 'assets/images/def/places-to-eat/featured_banner_in_house.jpg'

const SHOPPING_AD_IMAGE = 'assets/images/def/shopping/header_banner_in_house.jpg'
const SHOPPING_AD_IMAGE_MOBILE = 'assets/images/def/shopping/featured_banner_in_house.jpg'

const EVENTS_AD_IMAGE = 'assets/images/def/events/header_banner_in_house.jpg'
const EVENTS_AD_IMAGE_MOBILE = 'assets/images/def/events/featured_banner_in_house.jpg'

const HEADER_TIMER_INTERVAL = 16000

@Component({
  selector: 'app-header-ad-banner',
  templateUrl: './header-ad-banner.component.html',
  styleUrls: ['./header-ad-banner.component.css']
})
export class HeaderAdBannerComponent implements OnInit, OnDestroy {

  @Input() lat: number
  @Input() lng: number
  @Input() business: Business = new Business()
  @Input() ad: Ad = null
  @Input() accountType: string = null
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
              private deviceDetectorService: DeviceDetectorService,
              private loyaltyPointsService: LoyaltyPointsService) {
                this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
                  this.loyaltyPointBalance = loyaltyPointBalance
                })
  }

  getHeaderBanner(){
    let adId = null
    let accountType

    // Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton')

    if(needleElement.length > 1){
      // There's a componenet on top of the bottom header.
      return
    }

    if(this.editMode) {
      if(this.ad == null) {
        this.ad = new Ad()
        this.ad.id = 2
        adId = this.ad.id
      } else {
        adId = this.ad.id
      }

      accountType = parseInt(localStorage.getItem('spotbie_userType'), 10)

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
          break;
      }
    } else {
      switch(this.accountType){
        case 'food':
          accountType = 1
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE
          this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE
          break
        case 'shopping':
          accountType = 2
          this.genericAdImage = SHOPPING_AD_IMAGE
          this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE
          break
        case 'events':
          accountType = 3
          this.genericAdImage = EVENTS_AD_IMAGE
          this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE
          this.categories = this.eventsClassification
          break
      }
    }

    const headerBannerReqObj = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType
    }

    // Retrieve the SpotBie Ads
    this.adsService.getHeaderBanner(headerBannerReqObj).subscribe(resp => {
        this.getHeaderBannerAdCallback(resp)
      })
  }

  async getHeaderBannerAdCallback(resp: any){
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

      this.displayAd = true
      this.totalRewards = resp.totalRewards
    } else {
      console.log('getHeaderBannerAdCallback', resp)
    }

    if(!this.switchAdInterval){
      this.switchAdInterval = setInterval( () => {
        if(!this.editMode) this.getHeaderBanner()
      }, HEADER_TIMER_INTERVAL)
    }
  }

  getAdStyle(){
    if(this.editMode) {
      return {
        position : 'relative',
        margin : '0 auto',
        right: '0'
      }
    }
  }

  closeRewardMenu(){
    this.communityMemberOpen = false
  }

  clickGoToSponsored(){
    window.open('/business', '_blank')
  }

  switchAd(){
    this.categoriesListFriendly = []
    this.categoryListForUi = null
    this.getHeaderBanner()
  }

  openAd(): void{
    if(this.business != null){
      this.communityMemberOpen = true
    } else {
      window.open('/business', '_blank')
    }
  }

  updateAdImage(image: string = ''){
    if(image !== '') {
      this.ad.images = image
      this.genericAdImage = image
    }
  }

  updateAdImageMobile(image: string){
    if(image !== ''){
      this.ad.images_mobile = image
      this.genericAdImageMobile = image
    }
  }

  getAdWrapperClass(){
    if(!this.isMobile) return 'spotbie-ad-wrapper-header'
    if(this.isMobile) return 'spotbie-ad-wrapper-header sb-mobileAdWrapper'
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    this.isDesktop = this.deviceDetectorService.isDesktop()
    if(this.isMobile === false){
      this.isMobile = ( this.deviceDetectorService.isMobile() || this.deviceDetectorService.isTablet() )
    } else {
        this.isDesktop = false;
    }
    this.getHeaderBanner()
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    clearInterval(this.switchAdInterval)
    this.switchAdInterval = false
  }
}
