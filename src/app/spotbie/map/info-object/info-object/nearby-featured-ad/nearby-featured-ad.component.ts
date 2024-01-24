import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {AccountTypes} from '../../../../../helpers/enum/account-type.enum';
import {InfoObjectType} from '../../../../../helpers/enum/info-object-type.enum';
import {getDistanceFromLatLngInMiles} from '../../../../../helpers/measure-units.helper';
import {Ad} from '../../../../../models/ad';
import {Business} from '../../../../../models/business';
import {AdsService} from '../../../../ads/ads.service';
import {
  EVENT_CATEGORIES,
  FOOD_CATEGORIES,
  SHOPPING_CATEGORIES,
} from '../../../map_extras/map_extras';
import {getRandomInt} from '../../../../../helpers/numbers.helper';
import {BehaviorSubject} from 'rxjs';
import {BusinessMenuServiceService} from '../../../../../services/spotbie-logged-in/business-menu/business-menu-service.service';
import {Preferences} from '@capacitor/preferences';
import {AppLauncher} from '@capacitor/app-launcher';

const PLACE_TO_EAT_AD_IMAGE =
  'assets/images/def/places-to-eat/featured_banner_in_house.jpg';
const SHOPPING_AD_IMAGE =
  'assets/images/def/shopping/featured_banner_in_house.jpg';
const EVENTS_AD_IMAGE = 'assets/images/def/events/featured_banner_in_house.jpg';
const FEATURED_BANNER_TIMER_INTERVAL = 16000;

@Component({
  selector: 'app-nearby-featured-ad',
  templateUrl: './nearby-featured-ad.component.html',
  styleUrls: ['./nearby-featured-ad.component.css'],
})
export class NearbyFeaturedAdComponent implements OnInit {
  @Input() lat: number;
  @Input() lng: number;
  @Input() set business(business: Business) {
    this.business$.next(business);
  }
  @Input() set ad(ad: Ad | null) {
    this.ad$.next(ad);
  }
  @Input() set accountType(accType: string | number) {
    this.accountType$.next(accType);
  }
  @Input() editMode: boolean = false;
  @Input() categories: number;
  @Input() eventsClassification: number = null;

  accountType$: BehaviorSubject<number | string | null> = new BehaviorSubject(
    null
  );
  ad$: BehaviorSubject<Ad | null> = new BehaviorSubject<Ad>(null);
  link: string;
  displayAd: boolean = false;
  whiteIconSvg = 'assets/images/home_imgs/spotbie-white-icon.svg';
  distance: number = 0;
  totalRewards: number = 0;
  categoriesListFriendly: string[] = [];
  adIsOpen: boolean = false;
  rewardMenuOpen: boolean = false;
  isMobile: boolean = false;
  currentCategoryList: Array<string> = [];
  categoryListForUi: string = null;
  loyaltyPointBalance: any;
  adTypeWithId: boolean = false;
  adList: Array<Ad> = [];
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE;
  business$ = new BehaviorSubject(null);
  businessReady$ = new BehaviorSubject(false);
  switchAdInterval: any = false;

  constructor(
    private adsService: AdsService,
    private deviceDetectorService: DeviceDetectorService,
    private router: Router,
    private businessService: BusinessMenuServiceService
  ) {}

  async getNearByFeatured() {
    let adId = null;
    let accountType = null;

    const needleElement = document.getElementsByClassName('sb-closeButton');

    if (needleElement.length > 1) {
      return;
    }

    if (this.editMode) {
      if (!this.ad$.getValue()) {
        const ad = new Ad();
        ad.id = 2;
        this.ad$.next(ad);
        adId = ad.id;
      } else {
        adId = this.ad$.getValue().id;
      }

      const retAccType = await Preferences.get({key: 'spotbie_userType'});
      accountType = retAccType.value;

      switch (accountType) {
        case 1:
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
          break;
        case 2:
          this.genericAdImage = SHOPPING_AD_IMAGE;
          break;
        case 3:
          this.genericAdImage = EVENTS_AD_IMAGE;
          this.categories = this.eventsClassification;
          break;
      }
    } else {
      accountType = getRandomInt(1, 3).toString();
      switch (this.accountType$.getValue()) {
        case 1:
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
          break;
        case 2:
          this.genericAdImage = SHOPPING_AD_IMAGE;
          break;
        case 3:
          this.genericAdImage = EVENTS_AD_IMAGE;
          this.categories = this.eventsClassification;
          break;
      }
    }

    const nearByFeaturedObj = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType,
    };

    this.adsService.getNearByFeatured(nearByFeaturedObj).subscribe(resp => {
      this.getNearByFeaturedCallback(resp);
    });
  }

  async getNearByFeaturedCallback(resp: any) {
    if (resp.success) {
      this.ad$.next(resp.ad);
      const business = resp.business;

      if (!this.editMode && business) {
        switch (business.user_type) {
          case AccountTypes.PlaceToEat:
            this.currentCategoryList = FOOD_CATEGORIES;
            break;
          case AccountTypes.Events:
            this.currentCategoryList = EVENT_CATEGORIES;
            break;
          case AccountTypes.Shopping:
            this.currentCategoryList = SHOPPING_CATEGORIES;
            break;
        }

        this.categoriesListFriendly = [];

        this.currentCategoryList.reduce(
          (
            previousValue: string,
            currentValue: string,
            currentIndex: number,
            array: string[]
          ) => {
            if (resp.business.categories.indexOf(currentIndex) > -1) {
              this.categoriesListFriendly.push(
                this.currentCategoryList[currentIndex]
              );
            }
            return currentValue;
          }
        );

        business.is_community_member = true;
        business.type_of_info_object = InfoObjectType.SpotBieCommunity;

        this.distance = getDistanceFromLatLngInMiles(
          business.loc_x,
          business.loc_y,
          this.lat,
          this.lng
        );
      } else {
        this.distance = 5;
      }

      this.displayAd = true;
      this.totalRewards = resp.totalRewards;
      this.businessReady$.next(true);
      this.business$.next(business);

      if (!this.switchAdInterval) {
        this.switchAdInterval = setInterval(() => {
          if (!this.editMode) {
            this.getNearByFeatured();
          }
        }, FEATURED_BANNER_TIMER_INTERVAL);
      }
    } else {
      console.log('getNearByFeaturedCallback', resp);
    }
  }

  openAd(): void {
    AppLauncher.openUrl({
      url: `https://spotbie.com/business-menu/${
        this.business$.getValue().qr_code_link
      }`,
    });
  }

  ngOnInit(): void {
    this.isMobile = this.deviceDetectorService.isMobile();
    this.getNearByFeatured();
  }

  ngOnDestroy(): void {
    clearInterval(this.switchAdInterval);
    this.switchAdInterval = false;
  }
}
