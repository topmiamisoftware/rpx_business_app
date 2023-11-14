import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  metersToMiles,
  setYelpRatingImage,
} from '../../helpers/info-object-helper';
import {Gesture, GestureController} from '@ionic/angular';
import {Capacitor} from '@capacitor/core';
import {DateFormatPipe, TimeFormatPipe} from '../../pipes/date-format.pipe';
import {MapObjectIconPipe} from '../../pipes/map-object-icon.pipe';
import {LocationService} from '../../services/location-service/location.service';
import * as map_extras from './map_extras/map_extras';
import * as sorterHelpers from '../../helpers/results-sorter.helper';
import {SortOrderPipe} from '../../pipes/sort-order.pipe';
import {Business} from '../../models/business';
import {BottomAdBannerComponent} from '../ads/bottom-ad-banner/bottom-ad-banner.component';
import {HeaderAdBannerComponent} from '../ads/header-ad-banner/header-ad-banner.component';
import {environment} from '../../../environments/environment';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {Platform} from '@ionic/angular';
import {filter, tap} from 'rxjs/operators';
import {Geolocation} from '@capacitor/geolocation';
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from 'capacitor-native-settings';
import {Preferences} from '@capacitor/preferences';
import {BusinessDashboardComponent} from "../spotbie-logged-in/business-dashboard/business-dashboard.component";

const YELP_BUSINESS_SEARCH_API = 'https://api.yelp.com/v3/businesses/search';
const BANNED_YELP_IDS = map_extras.BANNED_YELP_IDS;
const SBCM_INTERVAL = 16000;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() business: boolean = false;
  @Input() spotType: any;

  @Output() signUpEvt = new EventEmitter();
  @Output() openBusinessSettingsEvt = new EventEmitter();

  // @ViewChild('homeDashboard') homeDashboard: BusinessDashboardComponent;
  // @ViewChild('featureWrapperAnchor') featureWrapperAnchor: ElementRef;
  @ViewChild('featureWrapper') featureWrapper: ElementRef;
  @ViewChild('scrollMapAppAnchor') scrollMapAppAnchor: ElementRef;
  @ViewChild('bottomAdBanner') bottomAdBanner: BottomAdBannerComponent = null;
  @ViewChild('singleAdApp') singleAdApp: HeaderAdBannerComponent = null;
  @ViewChild('categoryMenuSlide') categoryMenuSlide: ElementRef;

  loading$ = new BehaviorSubject<boolean>(false);

  private showOpenedParam: string;
  private n2_x = 0;
  private n3_x = 7;
  private rad_11 = null;
  private rad_1 = null;
  private finderSearchTimeout: any;
  private searchResultsOriginal$ = new BehaviorSubject<Array<any>>([]);

  // The map HTML container.
  spotbieMap: google.maps.Map;

  // The marker for the logged-in user.
  myMarker: google.maps.Marker;

  isLoggedIn$ = new BehaviorSubject<string>(null);
  spotbieUsername: string;
  userDefaultImage: string;
  searchResultsSubtitle: string;
  searchCategoriesPlaceHolder: string;
  sortByTxt: string = 'Distance';
  sortingOrder: string = 'asc';
  sortAc: number = 0;
  totalResults$ = new BehaviorSubject<number>(0);
  currentOffset$ = new BehaviorSubject<number>(0);
  itemsPerPage$ = new BehaviorSubject<number>(20);
  aroundMeSearchPage$ = new BehaviorSubject<number>(1);
  loadedTotalResults$ = new BehaviorSubject<number>(0);
  allPages$ = new BehaviorSubject<number>(0);
  maxDistanceCap: number = 45;
  maxDistance$ = new BehaviorSubject<number>(10);
  searchCategory$ = new BehaviorSubject<number>(null);
  previousSearchCategory: number;
  searchCategorySorter$ = new BehaviorSubject<number>(null);
  searchKeyword$ = new BehaviorSubject<string>(null);
  typeOfInfoObject$ = new BehaviorSubject<string>(null);
  eventDateParam: string;
  sortEventDate: string = 'none';
  showingOpenedStatus: string = 'Showing Opened & Closed';
  searchApiUrl: string;
  center: google.maps.LatLngLiteral;
  width: string;
  lat$ = new BehaviorSubject<number>(null);
  lng$ = new BehaviorSubject<number>(null);
  ogLat$ = new BehaviorSubject<number>(null);
  ogLng$ = new BehaviorSubject<number>(null);
  fitBounds: boolean = false;
  zoom: number = 18;
  map$ = new BehaviorSubject<boolean>(false);
  showSearchResults$ = new BehaviorSubject<boolean>(false);
  showSearchBox$ = new BehaviorSubject<boolean>(false);
  locationFound$ = new BehaviorSubject<boolean>(false);
  sliderRight: boolean = false;
  catsUp$ = new BehaviorSubject<boolean>(false);
  showNoResultsBox$ = new BehaviorSubject<boolean>(false);
  showMobilePrompt2$ = new BehaviorSubject<boolean>(false);
  firstTimeShowingMap: boolean = true;
  showOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentSearchType = '0';
  surroundingObjectList$ = new BehaviorSubject<Array<any>>([]);

  // This will store the third-party API search results.
  searchResults$ = new BehaviorSubject([]);

  // This will store the third-party API search resutls markers.
  searchResultsMarkers: any[] = [];

  // This will store the third-party API search results.
  communityMemberList$ = new BehaviorSubject<Array<Business>>([]);

  // This will store the third-party API search resutls markers.
  cmSearchResultsMarkers: any[] = [];

  eventCategories;
  eventClassifications = map_extras.EVENT_CATEGORIES;
  foodCategories = map_extras.FOOD_CATEGORIES;
  shoppingCategories = map_extras.SHOPPING_CATEGORIES;
  numberCategories$ = new BehaviorSubject<number>(null);
  bottomBannerCategories$ = new BehaviorSubject<number>(null);
  infoObject$: any = new BehaviorSubject(null);
  currentMarker: any;
  categories: any;
  myFavoritesWindow = {open: false};
  updateDistanceTimeout: any;
  isDesktop: boolean = false;
  isTablet: boolean = false;
  isMobile: boolean = false;
  displayLocationEnablingInstructions$ = new BehaviorSubject<boolean>(false);
  bannedYelpIDs = BANNED_YELP_IDS;
  eventsClassification$ = new BehaviorSubject<number>(null);
  getSpotBieCommunityMemberListInterval: any = false;
  currentCategoryList: any;

  constructor(
    private locationService: LocationService,
    private mapIconPipe: MapObjectIconPipe,
    private platform: Platform,
    private gestureCtrl: GestureController
  ) {
    this.init();

    combineLatest([this.lat$, this.lng$])
      .pipe(
        filter(([lat, lng]) => !!lat && !!lng),
        tap(([lat, lng]) => {
          this.spotbieMap.setCenter({lat, lng});

          // Delete myMarker from the map if it exists
          this.myMarker = new google.maps.Marker({
            position: {lat, lng},
            map: this.spotbieMap,
          });
        })
      )
      .subscribe();

    this.communityMemberList$
      .pipe(
        filter(cmList => cmList.length > 0),
        tap(async cmList => {
          const {AdvancedMarkerElement} = (await google.maps.importLibrary(
            'marker'
          )) as google.maps.MarkerLibrary;
          this.hideMarkers(this.cmSearchResultsMarkers);
          cmList.forEach(cm => {
            const el = this.createCmMarker(cm);
            const newMarker = new AdvancedMarkerElement({
              position: {
                lat: cm.loc_x,
                lng: cm.loc_y,
              },
              map: this.spotbieMap,
              content: el,
            });
            newMarker.addListener('click', ({_domEvent, _latLng}) => {
              this.pullSearchMarker(cm);
            });
            this.cmSearchResultsMarkers.push(newMarker);
          });
        })
      )
      .subscribe();

    this.searchResults$
      .pipe(
        filter(srList => srList.length > 0),
        tap(async srList => {
          const {AdvancedMarkerElement} = (await google.maps.importLibrary(
            'marker'
          )) as google.maps.MarkerLibrary;
          this.hideMarkers(this.searchResultsMarkers);
          srList.forEach(sr => {
            const el = this.createSrMarker(sr);
            const newMarker = new AdvancedMarkerElement({
              position: {
                lat: sr.coordinates.latitude,
                lng: sr.coordinates.longitude,
              },
              map: this.spotbieMap,
              content: el,
            });
            newMarker.addListener('click', ({_domEvent, _latLng}) => {
              this.pullSearchMarker(sr);
            });

            this.searchResultsMarkers.push(newMarker);
          });
        })
      )
      .subscribe();
  }

  async init() {
    const retIsLoggedIn = await Preferences.get({key: 'spotbie_loggedIn'});
    const retSpotbieUsername = await Preferences.get({
      key: 'spotbie_userLogin',
    });

    this.isLoggedIn$.next(retIsLoggedIn.value);
    this.spotbieUsername = retSpotbieUsername.value;
  }

  hideMarkers(markerList: google.maps.Marker[]): void {
    markerList.forEach(marker => marker.setMap(null));
    return;
  }

  createCmMarker(cm) {
    const el = document.createElement('div');
    el.className = 'spotbie-marker-bg sb-communityMember';
    el.style.background = `url('${cm.photo}')`;
    return el;
  }

  createSrMarker(sr) {
    const el = document.createElement('div');
    el.className = 'spotbie-marker-bg';
    el.style.background = `url('${sr.image_url}')`;
    return el;
  }

  ngOnInit() {
    this.isMobile = this.platform.is('mobile');
    this.isDesktop = this.platform.is('desktop');
    this.isTablet = this.platform.is('tablet');

    if (this.isDesktop || this.isTablet) {
      this.rad_11 = 0.00002;
    } else {
      this.rad_11 = 0.000014;
    }

    this.rad_1 = this.rad_11;
  }

  ngAfterViewInit() {
    if (this.isLoggedIn$.getValue() !== '1') {
      this.userDefaultImage = 'assets/images/guest-spotbie-user-01.svg';
      this.spotbieUsername = 'Guest';
    }
  }

  priceSortDesc(a, b) {
    a = a.price;
    b = b.price;

    if (!a) {
      return 1;
    } else if (!b) {
      return -1;
    }
    return a.length > b.length ? -1 : b.length > a.length ? 1 : 0;
  }

  deliverySort() {
    this.searchResults$.next(
      this.searchResults$
        .getValue()
        .filter(
          searchResult => searchResult.transactions.indexOf('delivery') > -1
        )
    );
  }

  pickUpSort() {
    this.searchResults$.next(
      this.searchResults$
        .getValue()
        .filter(
          searchResult => searchResult.transactions.indexOf('pickup') > -1
        )
    );
  }

  reservationSort() {
    this.searchResults$.next(
      this.searchResults$
        .getValue()
        .filter(
          searchResult =>
            searchResult.transactions.indexOf('restaurant_reservation') > -1
        )
    );
  }

  eventsToday() {
    this.sortEventDate = 'today';

    let startTime = new Date().toISOString().slice(0, 11);
    startTime = `${startTime}00:00:00Z`;

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);

    let newEndTime = endTime.toISOString().slice(0, 11);
    newEndTime = `${newEndTime}00:00:00Z`;

    this.eventDateParam = `startEndDateTime=${startTime},${newEndTime}`;
    this.apiSearch(this.searchKeyword$.getValue());
  }

  eventsThisWeekend() {
    this.sortEventDate = 'weekend';

    const startTime = this.nextWeekdayDate(new Date(), 5);

    let newStartTime = startTime.toISOString().slice(0, 11);
    newStartTime = `${newStartTime}00:00:00Z`;

    const endTime = this.nextWeekdayDate(new Date(), 1);

    let newEndTime = endTime.toISOString().slice(0, 11);
    newEndTime = `${newEndTime}00:00:00Z`;

    this.eventDateParam = `startEndDateTime=${newStartTime},${newEndTime}`;

    this.apiSearch(this.searchKeyword$.getValue());
  }

  nextWeekdayDate(date, dayInWeek) {
    const ret = new Date(date || new Date());
    ret.setDate(ret.getDate() + ((dayInWeek - 1 - ret.getDay() + 7) % 7) + 1);
    return ret;
  }

  showOpen() {
    this.showOpened$.next(!this.showOpened$.getValue());

    if (!this.showOpened$.getValue()) {
      this.showingOpenedStatus = 'Show Opened and Closed';
      this.showOpenedParam = 'open_now=true';
    } else {
      this.showingOpenedStatus = 'Show Opened';
      const unixTime = Math.floor(Date.now() / 1000);
      this.showOpenedParam = `open_at=${unixTime}`;
    }

    this.apiSearch(this.searchKeyword$.getValue());
  }

  updateDistance(value: number): void {
    clearTimeout(this.updateDistanceTimeout);

    this.updateDistanceTimeout = setTimeout(() => {
      this.maxDistance$.next(value);

      this.apiSearch(this.searchKeyword$.getValue());
    }, 500);
  }

  sortBy(ac: number) {
    this.sortAc = ac;

    switch (ac) {
      case 0:
        this.sortByTxt = 'Distance';
        break;
      case 1:
        this.sortByTxt = 'Rating';
        break;
      case 2:
        this.sortByTxt = 'Reviews';
        break;
      case 3:
        this.sortByTxt = 'Price';
        break;
      case 4:
        this.sortByTxt = 'Delivery';
        break;
      case 5:
        this.sortByTxt = 'Pick-up';
        break;
      case 6:
        this.sortByTxt = 'Reservations';
        break;
      case 7:
        this.sortByTxt = 'Events Today';
        break;
      case 8:
        this.sortByTxt = 'Events This Weekend';
        break;
    }

    if (ac !== 4 && ac !== 5 && ac !== 6 && ac !== 7 && ac !== 8) {
      if (this.sortingOrder === 'desc') {
        this.sortingOrder = 'asc';
      } else {
        this.sortingOrder = 'desc';
      }
    }

    const searchResults = this.searchResults$.getValue();
    switch (ac) {
      case 0:
        //sort by distance
        if (this.sortingOrder === 'desc') {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.distanceSortDesc)
          );
        } else {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.distanceSortAsc)
          );
        }
        break;
      case 1:
        //sort by rating
        if (this.sortingOrder === 'desc') {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.ratingSortDesc)
          );
        } else {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.ratingSortAsc)
          );
        }
        break;
      case 2:
        //sort by reviews
        console.log('REVIEW BY SORT', this.sortingOrder);
        if (this.sortingOrder === 'desc') {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.reviewsSortDesc)
          );
        } else {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.reviewsSortAsc)
          );
        }
        break;
      case 3:
        //sort by price
        if (this.sortingOrder === 'desc') {
          this.searchResults$.next(searchResults.sort(this.priceSortDesc));
        } else {
          this.searchResults$.next(
            searchResults.sort(sorterHelpers.priceSortAsc)
          );
        }
        break;
      case 4:
        //sort by delivery
        this.deliverySort();
        break;
      case 5:
        //sort by pick up
        this.pickUpSort();
        break;
      case 6:
        //sort by reservation
        this.reservationSort();
        break;
      case 7:
        //sort events by today
        this.eventsToday();
        break;
      case 8:
        //sort by this weekend
        this.eventsThisWeekend();
        break;
    }
  }

  classificationSearch(): void {
    this.loading$.next(true);
    this.locationService.getClassifications().subscribe(resp => {
      this.classificationSearchCallback(resp);
    });
  }

  classificationSearchCallback(httpResponse: any) {
    this.loading$.next(false);

    if (httpResponse.success) {
      const classifications: Array<any> =
        httpResponse.data._embedded.classifications;

      classifications.forEach(classification => {
        if (
          classification.type &&
          classification.type.name &&
          classification.type.name !== 'Undefined'
        ) {
          classification.name = classification.type.name;
        } else if (
          classification.segment &&
          classification.segment.name &&
          classification.segment.name !== 'Undefined'
        ) {
          classification.name = classification.segment.name;

          classification.segment._embedded.genres.forEach(genre => {
            genre.show_sub_sub = false;

            if (
              genre.name === 'Chanson Francaise' ||
              genre.name === 'Medieval/Renaissance' ||
              genre.name === 'Religious' ||
              genre.name === 'Undefined' ||
              genre.name === 'World'
            ) {
              classification.segment._embedded.genres.splice(
                classification.segment._embedded.genres.indexOf(genre),
                1
              );
            }
          });
        }

        if (classification.name) {
          classification.show_sub = false;

          if (
            classification.name !== 'Donation' &&
            classification.name !== 'Parking' &&
            classification.name !== 'Transportation' &&
            classification.name !== 'Upsell' &&
            classification.name !== 'Venue Based' &&
            classification.name !== 'Event Style' &&
            classification.name !== 'Individual' &&
            classification.name !== 'Merchandise' &&
            classification.name !== 'Group'
          ) {
            this.eventCategories.push(classification);
          }
        }
      });

      this.eventCategories = this.eventCategories.reverse();

      this.catsUp$.next(true);
    } else {
      console.log('getClassifications Error ', httpResponse);
    }

    this.loading$.next(false);
  }

  showEventSubCategory(subCat: any) {
    if (
      subCat._embedded.subtypes !== undefined &&
      subCat._embedded.subtypes.length === 1
    ) {
      this.apiSearch(subCat.name);
      return;
    } else if (
      subCat._embedded.subgenres !== undefined &&
      subCat._embedded.subgenres.length === 1
    ) {
      this.apiSearch(subCat.name);
      return;
    }

    subCat.show_sub_sub = !subCat.show_sub_sub;
  }

  showEventSub(classification: any) {
    this.eventsClassification$.next(
      this.eventClassifications.indexOf(classification.name)
    );
    classification.show_sub = !classification.show_sub;
  }

  newKeyWord() {
    this.totalResults$.next(0);
    this.allPages$.next(0);
    this.currentOffset$.next(0);
    this.aroundMeSearchPage$.next(1);
    this.searchResults$.next([]);
  }

  apiSearch(keyword: string, resetEventSorter = false) {
    this.loading$.next(true);
    this.searchKeyword$.next(keyword);

    keyword = encodeURIComponent(keyword);

    this.communityMemberList$.next([]);

    if (this.searchKeyword$.getValue() !== keyword) {
      this.newKeyWord();
    }

    if (resetEventSorter) {
      this.eventDateParam = undefined;
      this.sortEventDate = 'none';
    }

    let apiUrl: string;
    const lat = this.lat$.getValue();
    const lng = this.lng$.getValue();

    switch (this.searchCategory$.getValue()) {
      case 1: // food
        apiUrl = `${
          this.searchApiUrl
        }?latitude=${lat}&longitude=${lng}&term=${keyword}&categories=${keyword}&${
          this.showOpenedParam
        }&radius=40000&sort_by=rating&limit=20&offset=${this.currentOffset$.getValue()}`;
        this.numberCategories$.next(
          this.foodCategories.indexOf(this.searchKeyword$.getValue())
        );
        break;
      case 2: // shopping
        apiUrl = `${
          this.searchApiUrl
        }?latitude=${lat}&longitude=${lng}&term=${keyword}&categories=${keyword}&${
          this.showOpenedParam
        }&radius=40000&sort_by=rating&limit=20&offset=${this.currentOffset$.getValue()}`;
        this.numberCategories$.next(
          this.shoppingCategories.indexOf(this.searchKeyword$.getValue())
        );
        break;
      case 3: // events
        apiUrl = `size=20&latlong=${lat},${lng}&classificationName=${keyword}&radius=45&${this.eventDateParam}`;
        this.numberCategories$.next(
          this.eventCategories.indexOf(this.searchKeyword$.getValue())
        );
        break;
    }

    const searchObj = {
      config_url: apiUrl,
    };

    const searchObjSb = {
      loc_x: this.lat$.getValue(),
      loc_y: this.lng$.getValue(),
      categories: JSON.stringify(this.numberCategories$.getValue()),
    };

    switch (this.searchCategory$.getValue()) {
      case 1:
      case 2:
        // Retrieve the third party API Yelp Results
        this.locationService.getBusinesses(searchObj).subscribe(resp => {
          this.getBusinessesSearchCallback(resp);
        });

        // Retrieve the SpotBie Community Member Results
        this.locationService
          .getSpotBieCommunityMemberList(searchObjSb)
          .subscribe(resp => {
            this.getSpotBieCommunityMemberListCb(resp);
          });
        break;
      case 3:
        // Retrieve the SpotBie Community Member Results
        this.locationService.getEvents(searchObj).subscribe(resp => {
          this.getEventsSearchCallback(resp);
        });

        // Retrieve the SpotBie Community Member Results
        this.locationService
          .getSpotBieCommunityMemberList(searchObjSb)
          .subscribe(resp => {
            this.getSpotBieCommunityMemberListCb(resp);
          });
        break;
    }
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

  openWelcome() {
    this.scrollMapAppAnchor.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    this.catsUp$.next(false);
    this.map$.next(false);
    this.showSearchBox$.next(false);
    this.showSearchResults$.next(false);
    this.infoObject$.next(null);
    this.searchResults$.next([]);
  }

  sortingOrderClass(sortingOrder: string) {
    return new SortOrderPipe().transform(sortingOrder);
  }

  async setMap(coordinates) {
    this.map$.next(true);
    await this.initMap();
    this.showPosition(coordinates);
  }

  async spawnCategories(category: number) {
    this.infoObject$.next(null);
    this.showSearchBox$.next(true);

    if (this.searchCategory$.getValue() !== category) {
      this.previousSearchCategory = this.searchCategory$.getValue();
    }

    // If the category we picked is the same one as the
    // previously opened one then we can skip some steps.
    if (category === this.previousSearchCategory) {
      const coordinates = await Geolocation.getCurrentPosition();
      await this.setMap(coordinates);
      return;
    }

    this.loading$.next(true);
    this.scrollMapAppAnchor.nativeElement.scrollIntoView();
    this.zoom = 18;
    this.fitBounds = false;

    if (!this.locationFound$.getValue() && Capacitor.isNativePlatform()) {
      const hasPermissions = await this.checkPermission();

      if (hasPermissions) {
        const coordinates = await Geolocation.getCurrentPosition();
        await this.setMap(coordinates);
      } else {
        this.showMapError();
        return;
      }
    } else if (!this.locationFound$.getValue()) {
      window.navigator.geolocation.getCurrentPosition(
        async position => {
          await this.setMap(position);
        },
        err => {
          console.log(err);
          this.showMapError();
        }
      );
    } else if (this.locationFound$.getValue()) {
      const coordinates = await Geolocation.getCurrentPosition();
      await this.setMap(coordinates);
    }

    if (this.searchResults$.getValue().length === 0) {
      this.showSearchResults$.next(false);
    }

    this.searchCategory$.next(category);

    switch (this.searchCategory$.getValue()) {
      case 1:
        // food
        this.searchApiUrl = YELP_BUSINESS_SEARCH_API;
        this.searchCategoriesPlaceHolder = 'Search Places to Eat...';
        this.categories = this.foodCategories;
        this.bottomBannerCategories$.next(
          this.categories.indexOf(
            this.categories[Math.floor(Math.random() * this.categories.length)]
          )
        );
        break;
      case 2:
        // shopping
        this.searchApiUrl = YELP_BUSINESS_SEARCH_API;
        this.searchCategoriesPlaceHolder = 'Search Shopping...';
        this.categories = this.shoppingCategories;
        this.bottomBannerCategories$.next(
          this.categories.indexOf(
            this.categories[Math.floor(Math.random() * this.categories.length)]
          )
        );
        break;
      case 3:
        // events
        this.eventCategories = [];
        this.searchCategoriesPlaceHolder = 'Search Events...';
        this.categories = this.eventCategories;
        this.bottomBannerCategories$.next(
          this.categories.indexOf(
            this.categories[Math.floor(Math.random() * this.categories.length)]
          )
        );
        this.classificationSearch();
        return;
    }

    this.catsUp$.next(true);

    const closeCategoryPicker: Gesture = this.gestureCtrl.create(
      {
        el: this.categoryMenuSlide.nativeElement,
        threshold: 15,
        gestureName: 'closeCategoryPicker',
        onMove: ev => this.catsUp$.next(false),
      },
      true
    );

    closeCategoryPicker.enable();

    // I'm sure there's a better way to do this... but then again there's no time right now.
    const topBar = document.getElementsByTagName('ion-header')[1].clientHeight;
    setTimeout(() => {
      const spotbieCategories = document.getElementById('spotbieCategories');
      spotbieCategories.style.paddingTop = topBar + 'px';
    }, 500);
  }

  cleanCategory() {
    if (this.searchCategory$.getValue() !== this.previousSearchCategory) {
      this.searchResults$.next([]);

      switch (this.searchCategory$.getValue()) {
        case 1: // food
        case 2: // shopping
          this.typeOfInfoObject$.next('yelp_business');
          this.maxDistanceCap = 25;
          break;
        case 3: // events
          this.typeOfInfoObject$.next('ticketmaster_events');
          this.maxDistanceCap = 45;
          return;
      }
    }
  }

  goToQrCode() {
    this.closeCategories();
    this.openWelcome();
  }

  goToLp() {
    this.closeCategories();
    this.openWelcome();
  }

  closeCategories(): void {
    this.catsUp$.next(false);
  }

  searchSpotBie(evt: any): void {
    this.searchKeyword$.next(evt.target.value);

    const searchTerm = encodeURIComponent(evt.target.value);

    clearTimeout(this.finderSearchTimeout);

    this.finderSearchTimeout = setTimeout(() => {
      this.loading$.next(true);

      let apiUrl: string;

      if (this.searchCategory$.getValue() === 3) {
        // Used for loading events from ticketmaster API
        apiUrl = `size=20&latlong=${this.lat$.getValue()},${this.lng$.getValue()}&keyword=${searchTerm}&radius=45`;

        const searchObj = {
          config_url: apiUrl,
        };

        this.locationService.getEvents(searchObj).subscribe(resp => {
          this.getEventsSearchCallback(resp);
        });
      } else {
        //Used for loading places to eat and shopping from yelp
        apiUrl = `${
          this.searchApiUrl
        }?latitude=${this.lat$.getValue()}&longitude=${this.lng$.getValue()}&term=${searchTerm}&${
          this.showOpenedParam
        }&radius=40000&sort_by=best_match&limit=20&offset=${this.currentOffset$.getValue()}`;

        const searchObj = {
          config_url: apiUrl,
        };

        this.locationService.getBusinesses(searchObj).subscribe(resp => {
          this.getBusinessesSearchCallback(resp);
        });

        const searchObjSb = {
          loc_x: this.lat$.getValue(),
          loc_y: this.lng$.getValue(),
          categories: this.searchKeyword$.getValue(),
        };

        console.log('SEARCH OBJECT', searchObjSb);

        //Retrieve the SpotBie Community Member Results
        this.locationService
          .getSpotBieCommunityMemberList(searchObjSb)
          .subscribe(resp => {
            this.getSpotBieCommunityMemberListCb(resp);
          });
      }
    }, 1500);
  }

  displayPageNext(page: number) {
    if (page < this.allPages$.getValue()) {
      return {};
    } else {
      return {display: 'none'};
    }
  }

  displayPage(page: number) {
    if (page > 0) {
      return {};
    } else {
      return {display: 'none'};
    }
  }

  goToPage(action: string) {
    let page;
    switch (action) {
      case 'prev-two':
        page = this.aroundMeSearchPage$.getValue() - 2;
        break;
      case 'prev-one':
        page = this.aroundMeSearchPage$.getValue() - 1;
        break;
      case 'next-two':
        page = this.aroundMeSearchPage$.getValue() + 2;
        break;
      case 'next-one':
        page = this.aroundMeSearchPage$.getValue() + 1;
        break;
      case 'one':
        page = 1;
        break;
    }

    if (page < 1 || page > this.allPages$.getValue()) {
      return;
    }

    this.aroundMeSearchPage$.next(page);
    this.currentOffset$.next(
      this.aroundMeSearchPage$.getValue() * this.itemsPerPage$.getValue() -
        this.itemsPerPage$.getValue()
    );
    this.apiSearch(this.searchKeyword$.getValue());
    this.scrollMapAppAnchor.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  getMapWrapperClass() {
    if (this.showSearchResults$.getValue()) {
      return 'spotbie-map sb-map-results-open';
    } else {
      return 'spotbie-map';
    }
  }

  getMapClass() {
    return 'spotbie-agm-map sb-map-results-open';
  }

  getEventsSearchCallback(httpResponse: any): void {
    this.loading$.next(false);

    if (httpResponse.success) {
      this.totalResults$.next(httpResponse.data.page.totalElements);

      const eventObject = httpResponse.data;

      if (this.totalResults$.getValue() === 0) {
        this.showNoResultsBox$.next(true);
        this.loading$.next(false);
        this.searchResults$.next([]);
        return;
      } else {
        this.showNoResultsBox$.next(false);
        this.sortEventDate = 'none';
      }

      this.cleanCategory();

      window.scrollTo(0, 0);

      this.showSearchResults$.next(true);
      this.catsUp$.next(false);
      this.loading$.next(false);

      const eventObjectList = eventObject._embedded.events;

      this.allPages$.next(
        Math.ceil(this.totalResults$.getValue() / this.itemsPerPage$.getValue())
      );

      if (this.allPages$.getValue() === 0) {
        this.allPages$.next(1);
      }

      const searchResults = [];
      for (let i = 0; i < eventObjectList.length; i++) {
        eventObjectList[i].coordinates = {
          latitude: '',
          longitude: '',
        };

        eventObjectList[i].coordinates.latitude = parseFloat(
          eventObjectList[i]._embedded.venues[0].location.latitude
        );
        eventObjectList[i].coordinates.longitude = parseFloat(
          eventObjectList[i]._embedded.venues[0].location.longitude
        );
        eventObjectList[i].icon = eventObjectList[i].images[0].url;
        eventObjectList[i].image_url = this.ticketMasterLargestImage(
          eventObjectList[i].images
        );
        eventObjectList[i].type_of_info_object = 'ticketmaster_event';

        const dtObj = new Date(eventObjectList[i].dates.start.localDate);

        const timeDate = new DateFormatPipe().transform(dtObj);
        const timeHr = new TimeFormatPipe().transform(
          eventObjectList[i].dates.start.localTime
        );

        eventObjectList[i].dates.start.spotbieDate = timeDate;
        eventObjectList[i].dates.start.spotbieHour = timeHr;

        searchResults.push(eventObjectList[i]);
      }

      this.searchResults$.next(searchResults);

      this.drawMarkers();

      this.sortingOrder = 'desc';
      this.sortBy(0);

      this.searchCategorySorter$.next(this.searchCategory$.getValue());
      this.searchResultsSubtitle = 'Events';
      this.searchResultsOriginal$.next(this.searchResults$.getValue());
      this.showSearchResults$.next(true);
      this.showSearchBox$.next(true);
      this.loadedTotalResults$.next(this.searchResults$.getValue().length);
      this.maxDistance$.next(45);
    } else {
      console.log('getEventsSearchCallback Error: ', httpResponse);
    }

    this.loading$.next(false);
  }

  ticketMasterLargestImage(imageList: any) {
    const largestDimension = Math.max.apply(
      Math,
      imageList.map(image => image.width)
    );

    const largestImage = imageList.find(
      image => image.width === largestDimension
    );

    return largestImage.url;
  }

  getSpotBieCommunityMemberListCb(httpResponse: any) {
    if (httpResponse.success) {
      const communityMemberList: Array<Business> = httpResponse.data;

      communityMemberList.forEach((business: Business) => {
        business.type_of_info_object = 'spotbie_community';
        business.is_community_member = true;

        switch (this.searchCategory$.getValue()) {
          case 1:
            if (!business.photo) {
              business.photo = 'assets/images/home_imgs/find-places-to-eat.svg';
            }
            this.currentCategoryList = this.foodCategories;
            break;
          case 2:
            if (!business.photo) {
              business.photo =
                'assets/images/home_imgs/find-places-for-shopping.svg';
            }
            this.currentCategoryList = this.shoppingCategories;
            break;
          case 3:
            if (!business.photo) {
              business.photo = 'assets/images/home_imgs/find-events.svg';
            }
            this.currentCategoryList = this.eventClassifications;
        }

        const cleanCategories = [];

        this.currentCategoryList.reduce(
          (
            previousValue: string,
            currentValue: string,
            currentIndex: number,
            array: string[]
          ) => {
            if (business.categories.indexOf(currentIndex) > -1) {
              cleanCategories.push(this.currentCategoryList[currentIndex]);
            }
            return currentValue;
          }
        );

        business.cleanCategories = cleanCategories.toString();
        business.rewardRate = business.loyalty_point_dollar_percent_value / 100;
      });

      this.communityMemberList$.next(communityMemberList);

      if (this.getSpotBieCommunityMemberListInterval) {
        this.getSpotBieCommunityMemberListInterval = setInterval(() => {
          const searchObjSb = {
            loc_x: this.lat$.getValue(),
            loc_y: this.lng$.getValue(),
            categories: JSON.stringify(this.numberCategories$.getValue()),
          };

          // Retrieve the SpotBie Community Member Results
          this.locationService
            .getSpotBieCommunityMemberList(searchObjSb)
            .subscribe(resp => {
              this.getSpotBieCommunityMemberListCb(resp);
            });
        }, SBCM_INTERVAL);
      }
    }
  }

  getBusinessesSearchCallback(httpResponse: any): void {
    this.loading$.next(false);
    this.maxDistanceCap = 25;
    this.fitBounds = true;

    if (httpResponse.success) {
      this.totalResults$.next(httpResponse.data.total);

      if (this.totalResults$.getValue() === 0) {
        this.showNoResultsBox$.next(true);
        return;
      } else {
        this.showNoResultsBox$.next(false);
      }

      window.scrollTo(0, 0);

      this.cleanCategory();

      this.showSearchResults$.next(true);
      this.catsUp$.next(false);

      const placesResults = httpResponse.data;

      this.populateYelpResults(placesResults);

      this.searchCategorySorter$.next(this.searchCategory$.getValue());
      this.showSearchBox$.next(true);
    } else {
      console.log('Place Search Error: ', httpResponse);
    }
  }

  pullSearchMarker(infoObject: any): void {
    this.infoObject$.next(infoObject);
  }

  async initMap(): Promise<void> {
    const {Map} = (await google.maps.importLibrary(
      'maps'
    )) as google.maps.MapsLibrary;

    const mapOptions = this.getMapOptions();
    this.spotbieMap = new Map(
      document.getElementById('map') as HTMLElement,
      mapOptions
    );
  }

  checkSearchResultsFitBounds() {
    if (
      this.communityMemberList$.getValue().length < 3 &&
      this.searchResults$.getValue().length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkCommunityMemberFitBounds() {
    if (
      this.searchResults$.getValue().length < 3 ||
      this.communityMemberList$.getValue().length >= 3
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Fucntion gets called when the navigator's GPS system has found the user's location.
   *
   * @param position
   */
  async showPosition(position: any) {
    this.locationFound$.next(true);
    this.displayLocationEnablingInstructions$.next(false);

    if (environment.fakeLocation) {
      this.lat$.next(environment.myLocX);
      this.lng$.next(environment.myLocY);
      this.ogLat$.next(environment.myLocX);
      this.ogLng$.next(environment.myLocY);
    } else {
      this.lat$.next(position.coords.latitude);
      this.lng$.next(position.coords.longitude);
      this.ogLat$.next(position.coords.latitude);
      this.ogLng$.next(position.coords.longitude);
    }

    this.center = {
      lat: this.lat$.getValue(),
      lng: this.lng$.getValue(),
    };

    this.width = '100%';

    this.map$.next(true);

    if (this.firstTimeShowingMap) {
      this.firstTimeShowingMap = false;
      this.saveUserLocation();
    }

    this.showMobilePrompt2$.next(false);
    this.loading$.next(false);
  }

  pullMarker(mapObject: any): void {
    this.currentMarker = mapObject;
    this.sliderRight = true;
  }

  getSingleCatClass(i) {
    if (i % 2 === 0) {
      return 'spotbie-single-cat';
    } else {
      return 'spotbie-single-cat single-cat-light';
    }
  }

  saveUserLocation(): void {
    const saveLocationObj = {
      loc_x: this.lat$.getValue(),
      loc_y: this.lng$.getValue(),
    };

    if (this.isLoggedIn$.getValue() === '1') {
      this.locationService.saveCurrentLocation(saveLocationObj).subscribe(
        resp => {
          this.saveCurrentLocationCallback(resp);
        },
        error => {
          console.log('saveAndRetrieve Error', error);
        }
      );
    }
  }

  saveCurrentLocationCallback(resp: any): void {
    if (resp.message === 'success') {
      this.retrieveSurroudings();
    } else {
      console.log('saveCurrentLocationCallback Error', resp);
    }
  }

  retrieveSurroudings() {
    const retrieveSurroundingsObj = {
      loc_x: this.lat$.getValue(),
      loc_y: this.lng$.getValue(),
      search_type: this.currentSearchType,
    };

    this.locationService.retrieveSurroudings(retrieveSurroundingsObj).subscribe(
      resp => this.retrieveSurroudingsCallback(resp),
      error => console.log('saveAndRetrieve Error', error)
    );
  }

  retrieveSurroudingsCallback(resp: any) {
    const surroundingObjectList = resp.surrounding_object_list;
    const totalObjects = surroundingObjectList.length;

    if (totalObjects === undefined) {
      return;
    }

    let i = 0;
    for (let k = 0; k < totalObjects; k++) {
      i++;
      const coords = this.getNewCoords(
        surroundingObjectList[k].loc_x,
        surroundingObjectList[k].loc_y,
        i,
        totalObjects
      );
      surroundingObjectList[k].loc_x = coords.lat;
      surroundingObjectList[k].loc_y = coords.lng;

      if (surroundingObjectList[k].ghost_mode === 1) {
        surroundingObjectList[k].default_picture =
          'assets/images/ghost_white.jpg';
        surroundingObjectList[k].username = 'User is a Ghost';
        surroundingObjectList[k].description = `This user is a ghost.
                                                Ghost Users are not able to be befriended and their profiles remain hidden.`;
      } else {
        surroundingObjectList[k].description = unescape(
          surroundingObjectList[k].description
        );
      }
      surroundingObjectList[k].map_icon = this.mapIconPipe.transform(
        surroundingObjectList[k].default_picture
      );
    }

    this.loading$.next(false);
    this.showMobilePrompt2$.next(false);
    this.createObjectMarker(surroundingObjectList);
  }

  createObjectMarker(surroundingObjectList): void {
    this.surroundingObjectList$.next(surroundingObjectList);
  }

  getNewCoords(x, y, i, f): any {
    // Gives the current position an alternate coordinates
    // i is the current item
    // f is the total items
    let radius = null;

    if (this.n2_x - this.n3_x === 0) {
      radius = this.rad_1 + this.rad_11;
      this.rad_1 = radius;
      this.n2_x = 0;
      this.n3_x = this.n3_x + 7;
    } else {
      radius = this.rad_1;
    }

    this.n2_x = this.n2_x + 1;

    const angle = (i / this.n3_x) * Math.PI * 2;
    x = this.lat$.getValue() + Math.cos(angle) * radius;
    y = this.lng$.getValue() + Math.sin(angle) * radius;

    const p = {lat: x, lng: y};
    return p;
  }

  closeSearchResults() {
    this.closeCategories();
    this.showSearchResults$.next(false);
    this.showSearchBox$.next(false);
    this.map$.next(false);
  }

  myFavorites(): void {
    this.myFavoritesWindow.open = true;
  }

  showMapError() {
    // Check for location permission and prompt the user.
    alert("Please enable location to find SpotBie locations.");

    this.displayLocationEnablingInstructions$.next(true);
    this.map$.next(false);
    this.loading$.next(false);
    this.closeCategories();
    this.cleanCategory();
  }

  mobileStartLocation() {
    this.loading$.next(true);
    this.spawnCategories(1);

    this.showMobilePrompt2$.next(true);
  }

  private async populateYelpResults(data: any) {
    let results = data.businesses;

    let i = 0;
    const resultsToRemove = [];

    results.forEach(business => {
      //Remove some banned yelp results.
      if (this.bannedYelpIDs.indexOf(business.id) > -1) {
        resultsToRemove.push(i);
      }

      business.rating_image = setYelpRatingImage(business.rating);
      business.type_of_info_object = this.typeOfInfoObject$.getValue();
      business.type_of_info_object_category = this.searchCategory$.getValue();
      business.is_community_member = false;

      if (business.is_closed) {
        business.is_closed_msg = 'Closed';
      } else {
        business.is_closed_msg = 'Open';
      }

      if (business.price) {
        business.price_on = '1';
      }

      if (business.image_url === '') {
        business.image_url = '0';
      }

      let friendlyTransaction = '';

      business.transactions = business.transactions.sort();

      switch (business.transactions.length) {
        case 0:
          friendlyTransaction = '';
          business.transactions_on = '0';
          break;
        case 1:
        case 2:
        case 3:
          business.transactions_on = '1';
          business.transactions = [
            business.transactions.slice(0, -1).join(', '),
            business.transactions.slice(-1)[0],
          ].join(business.transactions.length < 2 ? '' : ', and ');
          friendlyTransaction = business.transactions.replace(
            'restaurant_reservation',
            'restaurant reservations'
          );
          friendlyTransaction = friendlyTransaction + '.';
          break;
      }

      business.friendly_transactions = friendlyTransaction;
      business.distance = metersToMiles(business.distance);
      business.icon = business.image_url;
      i++;
    });

    for (let y = 0; y < resultsToRemove.length; y++) {
      results.splice(resultsToRemove[y], 1);
    }

    this.searchResultsOriginal$.next(results);

    results = results.filter(
      searchResult => searchResult.distance < this.maxDistance$.getValue()
    );

    this.searchResults$.next(results);

    this.drawMarkers();

    if (this.sortingOrder === 'desc') {
      this.sortingOrder = 'asc';
    } else {
      this.sortingOrder = 'desc';
    }

    this.sortBy(this.sortAc);

    switch (this.searchCategory$.getValue()) {
      case 1:
        this.searchResultsSubtitle = 'Spots';
        break;
      case 2:
        this.searchResultsSubtitle = 'Shopping Spots';
        break;
    }

    this.loadedTotalResults$.next(this.searchResults$.getValue().length);

    this.allPages$.next(
      Math.ceil(this.totalResults$.getValue() / this.itemsPerPage$.getValue())
    );

    if (this.allPages$.getValue() === 0) {
      this.allPages$.next(1);
    }

    if (this.loadedTotalResults$.getValue() > 1000) {
      this.totalResults$.next(1000);
      this.loadedTotalResults$.next(1000);
      this.allPages$.next(20);
    }
  }

  drawMarkers() {
    const markers = this.searchResults$.getValue();
    const bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
      bounds.extend({
        lat: markers[i].coordinates.latitude,
        lng: markers[i].coordinates.longitude,
      });
    }

    this.spotbieMap.fitBounds(bounds);
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

  openBusinesSettings() {
    this.openBusinessSettingsEvt.emit()
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

  openTerms() {}
}
