import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import {AdsService} from '../ads.service';
import {Business} from '../../../models/business';
import {Ad} from '../../../models/ad';
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject} from "rxjs";
import {BusinessLoyaltyPointsState} from "../../spotbie-logged-in/state/business.lp.state";
import {LoyaltyPointBalance} from "../../../models/loyalty-point-balance";
import {UserauthService} from "../../../services/userauth.service";

const PLACE_TO_EAT_AD_IMAGE = 'assets/images/def/places-to-eat/header_banner_in_house.jpg'
const PLACE_TO_EAT_AD_IMAGE_MOBILE = 'assets/images/def/places-to-eat/featured_banner_in_house.jpg'

const SHOPPING_AD_IMAGE = 'assets/images/def/shopping/header_banner_in_house.jpg'
const SHOPPING_AD_IMAGE_MOBILE = 'assets/images/def/shopping/featured_banner_in_house.jpg'

const EVENTS_AD_IMAGE = 'assets/images/def/events/header_banner_in_house.jpg'
const EVENTS_AD_IMAGE_MOBILE = 'assets/images/def/events/featured_banner_in_house.jpg'

@Component({
  selector: 'app-header-ad-banner',
  templateUrl: './header-ad-banner.component.html',
  styleUrls: ['./header-ad-banner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderAdBannerComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() business: Business = new Business();
  @Input() ad: Ad = null;
  @Input() accountType: number = null;
  @Input() categories: number;
  @Input() eventsClassification: number = null;
  @Input() isMobile: boolean = false;
  @Input() isDesktop: boolean = false;

  link: string;
  displayAd = false;
  distance: number = 0;
  totalRewards: number = 0;
  loyaltyPointBalance$ = new BehaviorSubject<LoyaltyPointBalance>(null);
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE;
  genericAdImageMobile: string = PLACE_TO_EAT_AD_IMAGE_MOBILE;

  constructor(private adsService: AdsService,
              private changeDetectorRef: ChangeDetectorRef,
              private loyaltyPointsState: BusinessLoyaltyPointsState,
              private userService: UserauthService,
  ) {
    this.loyaltyPointBalance$.next(this.loyaltyPointsState.getState());
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.getHeaderBanner();
  }

  ngOnChanges() {
    this.changeDetectorRef.markForCheck();
  }

  async getHeaderBanner(){
    let adId = null;
    let accountType = null;

    if (!this.ad) {
      this.ad = new Ad();
      this.ad.id = 2;
      adId = this.ad.id;
    } else {
      adId = this.ad.id;
    }

    accountType = await Preferences.get({ key: 'spotbie_userType'});
    accountType = parseInt(accountType.value, 10);

    switch (accountType) {
      case 1:
        this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
        this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE;
        break;
      case 2:
        this.genericAdImage = SHOPPING_AD_IMAGE;
        this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE;
        break;
      case 3:
        this.genericAdImage = EVENTS_AD_IMAGE;
        this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE;
        this.categories = this.eventsClassification;
        break;
    }

    const headerBannerReqObj = {
      categories: this.categories,
      id: adId,
      account_type: accountType
    }

    // Retrieve the SpotBie Ads
    this.adsService.getHeaderBanner(headerBannerReqObj).subscribe(resp =>
      this.getHeaderBannerAdCallback(resp)
    );
  }

  async getHeaderBannerAdCallback(resp: any){
    if(resp.success) {
      this.ad = resp.ad;
      this.business = this.userService.userProfile$.getValue().business;

      this.displayAd = true;
      this.totalRewards = resp.totalRewards;

      this.changeDetectorRef.detectChanges();
    } else {
      console.log('getHeaderBannerAdCallback', resp);
    }
  }

  getAdStyle(){
    return {
      position : 'relative',
      margin : '0 auto',
      right: '0'
    };
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

  getAdWrapperClass(){
    if(this.isDesktop) return 'spotbie-ad-wrapper-header'
    if(this.isMobile) return 'spotbie-ad-wrapper-header sb-mobileAdWrapper'
  }
}
