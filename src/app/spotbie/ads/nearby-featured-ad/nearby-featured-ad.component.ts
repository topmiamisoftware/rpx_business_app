import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Ad} from '../../../models/ad';
import {Business} from '../../../models/business';
import {AdsService} from '../ads.service';
import {Preferences} from "@capacitor/preferences";
import {BusinessLoyaltyPointsState} from "../../spotbie-logged-in/state/business.lp.state";
import {BehaviorSubject} from "rxjs";
import {LoyaltyPointBalance} from "../../../models/loyalty-point-balance";

const PLACE_TO_EAT_AD_IMAGE_MOBILE = 'assets/images/def/places-to-eat/featured_banner_in_house.jpg';
const PLACE_TO_EAT_AD_IMAGE = 'assets/images/def/places-to-eat/featured_banner_in_house.jpg';
const SHOPPING_AD_IMAGE = 'assets/images/def/shopping/featured_banner_in_house.jpg';
const EVENTS_AD_IMAGE = 'assets/images/def/events/featured_banner_in_house.jpg';

@Component({
  selector: 'app-nearby-featured-ad',
  templateUrl: './nearby-featured-ad.component.html',
  styleUrls: ['./nearby-featured-ad.component.css'],
})
export class NearbyFeaturedAdComponent implements OnInit, OnChanges {

  @Input() lat: number
  @Input() lng: number
  @Input() business: Business = new Business()
  @Input() ad: Ad = null
  @Input() accountType: number = null
  @Input() categories: number
  @Input() eventsClassification: number = null

  link: string;
  displayAd: boolean = false;
  distance: number = 0;
  totalRewards: number = 0;
  loyaltyPointBalance$ = new BehaviorSubject<LoyaltyPointBalance>(null);
  adList: Array<Ad> = [];
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE;
  businessReady: boolean = false;
  genericAdImageMobile: string = PLACE_TO_EAT_AD_IMAGE_MOBILE;

  constructor(private adsService: AdsService,
              private deviceDetectorService: DeviceDetectorService,
              private changeDetection: ChangeDetectorRef,
              private businessLoyaltyState: BusinessLoyaltyPointsState
  ) {
    this.loyaltyPointBalance$.next(this.businessLoyaltyState.getState());
  }

  ngOnChanges(){
    this.changeDetection.markForCheck();
  }

  ngOnInit(): void {
    this.getNearByFeatured();
  }

  async getNearByFeatured(){
    let adId = null
    let accountType

    // Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton')

    if (needleElement.length > 1) {
      // There's a component aside from the infoObjectWindow
      return; // bounce this request
    }

    if (!this.ad) {
      this.ad = new Ad();
      this.ad.id = 2;
      adId = this.ad.id;
    } else {
      adId = this.ad.id;
    }

    accountType = await Preferences.get({key: 'spotbie_userType'});
    accountType = parseInt(accountType.value, 10);

    switch(accountType){
      case 1:
        this.genericAdImage = PLACE_TO_EAT_AD_IMAGE
        break
      case 2:
        this.genericAdImage = SHOPPING_AD_IMAGE
        break
      case 3:
        this.genericAdImage = EVENTS_AD_IMAGE
        this.categories = this.eventsClassification
        break
    }

    const nearByFeaturedObj = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType
    }

    // Retrieve the SpotBie Ads
    this.adsService.getNearByFeatured(nearByFeaturedObj).subscribe(
      resp => {
        this.getNearByFeaturedCallback(resp)
      }
    )
  }

  async getNearByFeaturedCallback(resp: any){
    if(resp.success){
      this.ad = resp.ad;
      this.business = resp.business;
      this.businessReady = true;
      this.distance = 5;

      this.totalRewards = resp.totalRewards;
      this.displayAd = true;

      this.changeDetection.detectChanges();
    } else {
      console.log('getNearByFeaturedCallback', resp);
    }
  }

  updateAdImage(image: string = ''){
    if(image !== ''){
      this.ad.images_mobile = image;
      this.ad.images = image;
      this.genericAdImage = image;
    }
    this.changeDetection.detectChanges();
  }

  getAdWrapperClass(){
    return 'spotbie-ad-wrapper-header sb-mobileAdWrapper'
  }

  getAdStyle(){
    return {
      position : 'relative',
      margin : '0 auto',
      right: '0'
    };
  }
}
