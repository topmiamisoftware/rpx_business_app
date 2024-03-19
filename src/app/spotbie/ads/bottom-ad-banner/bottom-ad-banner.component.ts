import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {InfoObjectType} from '../../../helpers/enum/info-object-type.enum';
import {getDistanceFromLatLngInMiles} from '../../../helpers/measure-units.helper';
import {Ad} from '../../../models/ad';
import {Business} from '../../../models/business';
import {EVENT_CATEGORIES, FOOD_CATEGORIES, SHOPPING_CATEGORIES} from '../../map/map_extras/map_extras';
import {AdsService} from '../ads.service';
import {Preferences} from "@capacitor/preferences";
import {BusinessLoyaltyPointsState} from "../../spotbie-logged-in/state/business.lp.state";
import {BehaviorSubject} from "rxjs";
import {LoyaltyPointBalance} from "../../../models/loyalty-point-balance";

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
export class BottomAdBannerComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() lat: number
  @Input() lng: number
  @Input() business: Business = new Business()
  @Input() ad: Ad = null
  @Input() accountType: number = null
  @Input() categories: number
  @Input() eventsClassification: number = null
  @Input() isMobile: boolean = false
  @Input() isDesktop: boolean = false

  link: string
  displayAd: boolean = false
  distance: number = 0
  totalRewards: number = 0
  loyaltyPointBalance$ = new BehaviorSubject<LoyaltyPointBalance>(null);
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE
  genericAdImageMobile: string = PLACE_TO_EAT_AD_IMAGE_MOBILE

  constructor(private adsService: AdsService,
              private changeDetectorRef: ChangeDetectorRef,
              private loyaltyPointState: BusinessLoyaltyPointsState
  ) {
    this.loyaltyPointBalance$.next(this.loyaltyPointState.getState());
  }

  ngOnChanges() {
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.getBottomHeader();
  }

  async getBottomHeader(){
    let adId = null
    let accountType;

    // Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton');

    if (needleElement.length > 1) {
      // There's a component on top of the bottom header.
      // I know this a rudimentary way for doing this but yeah.
      return
    }

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
        break;
      case 2:
        this.genericAdImage = SHOPPING_AD_IMAGE
        this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE
        break;
      case 3:
        this.genericAdImage = EVENTS_AD_IMAGE
        this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE
        this.categories = this.eventsClassification
        break;
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
    return {
      'position' : 'relative',
      'margin' : '0 auto',
      'right': '0'
    }
  }

  getAdWrapperClass(){
    if(this.isDesktop) return 'spotbie-ad-wrapper-header';
    if(this.isMobile) return 'spotbie-ad-wrapper-header sb-mobileAdWrapper';
  }

  async getBottomHeaderCb(resp: any){
    if(resp.success) {
      this.ad = resp.ad;
      this.business = resp.business;

      this.totalRewards = resp.totalRewards;
      this.displayAd = true;

      this.changeDetectorRef.detectChanges();
    }
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
}
