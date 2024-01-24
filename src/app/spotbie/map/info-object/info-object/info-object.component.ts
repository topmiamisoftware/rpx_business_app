import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import {InfoObjectServiceService} from './info-object-service.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DateFormatPipe, TimeFormatPipe} from '../../../../pipes/date-format.pipe';
import {SpotbieMetaService} from '../../../../services/meta/spotbie-meta.service';
import {setYelpRatingImage} from '../../../../helpers/info-object-helper';
import {
  spotbieMetaDescription,
  spotbieMetaTitle,
  spotbieMetaImage,
} from '../../../../constants/spotbie';
import {InfoObject} from '../../../../models/info-object';
import {environment} from '../../../../../environments/environment';
import {Ad} from '../../../../models/ad';
import {InfoObjectType} from '../../../../helpers/enum/info-object-type.enum';
import {BehaviorSubject} from 'rxjs';
import {AppLauncher} from '@capacitor/app-launcher';
import {Preferences} from '@capacitor/preferences';
import {Share} from '@capacitor/share';

const YELP_BUSINESS_DETAILS_API = 'https://api.yelp.com/v3/businesses/';

const SPOTBIE_META_DESCRIPTION = spotbieMetaDescription;
const SPOTBIE_META_TITLE = spotbieMetaTitle;
const SPOTBIE_META_IMAGE = spotbieMetaImage;

@Component({
  selector: 'app-info-object',
  templateUrl: './info-object.component.html',
  styleUrls: ['./info-object.component.css'],
})
export class InfoObjectComponent implements OnInit, AfterViewInit {
  @Input() set info_object(infoObject: InfoObject) {
    this.accountType = infoObject.user_type;
    this.infoObject$.next(infoObject);
  }
  @Input() ad: Ad;
  @Input() fullScreenMode: boolean = false;
  @Input() lat: number = null;
  @Input() lng: number = null;
  @Input() accountType: string | number;
  @Input() eventsClassification: number = null;
  @Input() categories: number;

  @Output() closeWindow = new EventEmitter();
  @Output() removeFavoriteEvent = new EventEmitter();

  loading$ = new BehaviorSubject(false);
  rewardMenuUp$ = new BehaviorSubject(false);
  urlApi: string;
  infoObject$: BehaviorSubject<InfoObject> | null =
    new BehaviorSubject<InfoObject>(null);
  infoObjectImageUrl: string;
  private infoObjectCategory: number;
  isLoggedIn$ = new BehaviorSubject<string>(null);
  infoObjectLink: string;
  infoObjectDescription: string;
  infoObjectTitle: string;
  objectCategories: string = '';
  objectDisplayAddress$ = new BehaviorSubject<string>(null);
  eInfoObjectType: any = InfoObjectType;

  constructor(
    private infoObjectService: InfoObjectServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spotbieMetaService: SpotbieMetaService
  ) {}

  getFullScreenModeClass() {
    if (this.fullScreenMode) return 'fullScreenMode';
    else return '';
  }

  closeWindowX(): void {
    if (
      this.router.url.indexOf('event') > -1 ||
      this.router.url.indexOf('place-to-eat') > -1 ||
      this.router.url.indexOf('shopping') > -1 ||
      this.router.url.indexOf('community') > -1
    ) {
      this.router.navigate(['/home']);
    } else {
      this.closeWindow.emit(null);
      this.spotbieMetaService.setTitle(SPOTBIE_META_TITLE);
      this.spotbieMetaService.setDescription(SPOTBIE_META_DESCRIPTION);
      this.spotbieMetaService.setImage(SPOTBIE_META_IMAGE);
    }
  }

  private pullInfoObject(): void {
    if (this.router.url.indexOf('event') > -1) {
      const infoObjectId = this.activatedRoute.snapshot.paramMap.get('id');
      this.urlApi = `id=${infoObjectId}`;
    }

    const infoObjToPull = {
      config_url: this.urlApi,
    };

    if (this.router.url.indexOf('event') > -1) {
      this.infoObjectService.pullEventObject(infoObjToPull).subscribe(resp => {
        this.getEventCallback(resp);
      });
    } else {
      this.infoObjectService.pullInfoObject(infoObjToPull).subscribe(resp => {
        this.pullInfoObjectCallback(resp);
      });
    }
  }

  private pullInfoObjectCallback(httpResponse: any): void {
    if (httpResponse.success) {
      const infoObject = httpResponse.data as InfoObject;
      infoObject.type_of_info_object_category = this.infoObjectCategory;

      if (infoObject.is_community_member) {
        this.infoObjectImageUrl =
          'assets/images/home_imgs/spotbie-green-icon.svg';
      } else {
        this.infoObjectImageUrl =
          'assets/images/home_imgs/spotbie-white-icon.svg';
      }

      if (
        this.router.url.indexOf('place-to-eat') > -1 ||
        infoObject.type_of_info_object_category === 1
      ) {
        infoObject.type_of_info_object = InfoObjectType.Yelp;
        infoObject.type_of_info_object_category = 1;
        this.infoObjectLink = `${environment.baseUrl}place-to-eat/${infoObject.alias}/${infoObject.id}`;
      }

      if (
        this.router.url.indexOf('shopping') > -1 ||
        infoObject.type_of_info_object_category === 2
      ) {
        infoObject.type_of_info_object = InfoObjectType.Yelp;
        infoObject.type_of_info_object_category = 2;
        this.infoObjectLink = `${environment.baseUrl}shopping/${infoObject.alias}/${infoObject.id}`;
      }

      if (
        this.router.url.indexOf('events') > -1 ||
        infoObject.type_of_info_object_category === 3
      ) {
        infoObject.type_of_info_object = InfoObjectType.TicketMaster;
        infoObject.type_of_info_object_category = 3;
        this.infoObjectLink = `${environment.baseUrl}event/${infoObject.alias}/${infoObject.id}`;
      }

      if (infoObject.is_community_member) {
        infoObject.type_of_info_object = InfoObjectType.SpotBieCommunity;
        infoObject.image_url = infoObject.photo;
        this.infoObjectLink = `${environment.baseUrl}${infoObject.name}/${infoObject.id}`;
      }

      if (infoObject.hours) {
        infoObject.hours.forEach(hours => {
          if (hours.hours_type === 'REGULAR') {
            infoObject.isOpenNow = hours.is_open_now;
          }
        });
      }

      if (!infoObject.is_community_member) {
        this.objectDisplayAddress$.next(this.infoObject$.getValue().location.display_address.join(', '));
      }

      infoObject.categories.forEach(category => {
        this.objectCategories = `${this.objectCategories}, ${category.title}`;
      });

      this.objectCategories = this.objectCategories.substring(
        2,
        this.objectCategories.length
      );

      switch (infoObject.type_of_info_object_category) {
        case 1:
          this.infoObjectTitle = `${infoObject.name} - ${
            this.objectCategories
          } - ${this.objectDisplayAddress$.getValue()}`;
          this.infoObjectDescription = `Let's go eat at ${
            infoObject.name
          }. They are located at ${this.objectDisplayAddress$.getValue()}.`;
          break;
        case 2:
          this.infoObjectTitle = `${infoObject.name} - ${
            this.objectCategories
          } - ${this.objectDisplayAddress$.getValue()}`;
          this.infoObjectDescription = `I really recommend you go shopping at ${infoObject.name}!`;
          break;
      }

      infoObject.rating_image = setYelpRatingImage(infoObject.rating);

      this.spotbieMetaService.setTitle(this.infoObjectTitle);
      this.spotbieMetaService.setDescription(this.infoObjectDescription);
      this.spotbieMetaService.setImage(this.infoObjectImageUrl);

      this.infoObject$.next(infoObject);
      this.loading$.next(false);
    } else {
      console.log('pullInfoObjectCallback', httpResponse);
    }
  }

  async openWithGoogleMaps() {
    const confirmNav = confirm(
      "We will try to open and navigate on your device's default navigation app."
    );

    let displayAddress = '';

    if (
      this.infoObject$.getValue().type_of_info_object === 'spotbie_community'
    ) {
      displayAddress = this.infoObject$.getValue().address;
    } else {
      this.infoObject$.getValue().location.display_address.forEach(element => {
        displayAddress = displayAddress + ' ' + element;
      });
    }

    if (confirmNav) {
      await AppLauncher.openUrl({
        url: `http://www.google.com/maps/place/${encodeURI(displayAddress)}`,
      });
    }

    return;
  }

  share() {
    console.log('infoObjectTitle', this.infoObjectTitle);
    console.log('infoObjectDescription', this.infoObjectDescription);
    console.log('infoObjectLink', this.infoObjectLink);
    Share.share({
      title: this.infoObjectTitle,
      text: this.infoObjectDescription,
      url: this.infoObjectLink,
      dialogTitle: 'Share Spot...',
    });
  }

  getIconStyle() {
    if (
      this.infoObject$.getValue().type_of_info_object ===
      InfoObjectType.SpotBieCommunity
    ) {
      return {color: 'white'};
    } else {
      return {color: '#333'};
    }
  }

  async goToTicket() {
    await AppLauncher.openUrl({url: this.infoObject$.getValue().url});
    return;
  }

  getTitleStyling(): string {
    let className = 'sb-titleGrey text-uppercase';
    if (this.infoObject$.getValue().is_community_member) {
      className = 'spotbie-text-gradient sb-titleGreen text-uppercase';
    }
    return className;
  }

  getCloseButtonStyling(): {color: string} {
    let style = {color: 'white'};
    if (!this.infoObject$.getValue().is_community_member) {
      style = {color: '#332f3e'};
    }
    return style;
  }

  getOverlayWindowStyling(): string {
    let className = 'spotbie-overlay-window infoObjectWindow has-header';
    if (this.infoObject$.getValue().is_community_member) {
      className = 'spotbie-overlay-window communityMemberWindow has-header';
    }
    return className;
  }

  getFontClasses(): string {
    let className = 'text-uppercase';
    if (this.infoObject$.getValue().is_community_member) {
      className = 'spotbie-text-gradient text-uppercase';
    }
    return className;
  }

  getEventCallback(httpResponse: any): void {
    const eventObject = httpResponse.data._embedded.events[0] ?? undefined;

    if (httpResponse.success && eventObject) {
      eventObject.coordinates = {
        latitude: '',
        longitude: '',
      };

      eventObject.coordinates.latitude = parseFloat(
        eventObject._embedded.venues[0].location.latitude
      );
      eventObject.coordinates.longitude = parseFloat(
        eventObject._embedded.venues[0].location.longitude
      );
      eventObject.icon = eventObject.images[0].url;
      eventObject.image_url = eventObject.images[8].url;
      eventObject.type_of_info_object = 'ticketmaster_event';

      const datetObj = new Date(eventObject.dates.start.localDate);
      const timeDate = new DateFormatPipe().transform(datetObj);
      const timeHr = new TimeFormatPipe().transform(
        eventObject.dates.start.localTime
      );

      eventObject.dates.start.spotbieDate = timeDate;
      eventObject.dates.start.spotbieHour = timeHr;

      this.infoObject$.next(eventObject);
      this.setEventMetaData();
    } else {
      console.log('getEventsSearchCallback Error: ', httpResponse);
    }

    this.loading$.next(false);
    return;
  }

  setEventMetaData(): void {
    const infoObject = this.infoObject$.getValue();
    const alias = infoObject.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[-]+/g, '-')
      .replace(/[^\w-]+/g, '');
    const title = `${infoObject.name} at ${infoObject._embedded.venues[0].name}`;

    if (infoObject.is_community_member) {
      this.infoObjectImageUrl = `${environment.baseUrl}${infoObject.type_of_info_object_category}/${infoObject.id}`;
    } else {
      this.infoObjectLink = `${environment.baseUrl}event/${alias}/${infoObject.id}`;
    }

    this.infoObjectDescription = `Hey! Let's go to ${infoObject.name} together. It's at ${infoObject._embedded.venues[0].name} located in ${infoObject._embedded.venues[0].address.line1}, ${infoObject._embedded.venues[0].city.name} ${infoObject._embedded.venues[0].postalCode}. Prices range from $${infoObject.priceRanges[0].min} to $${infoObject.priceRanges[0].min}`;
    this.infoObjectTitle = title;

    this.spotbieMetaService.setTitle(title);
    this.spotbieMetaService.setDescription(this.infoObjectDescription);
    this.spotbieMetaService.setImage(infoObject.image_url);

    return;
  }

  async visitInfoObjectPage() {
    const infoObject = this.infoObject$.getValue();
    if (infoObject.type_of_info_object === InfoObjectType.Yelp) {
      await AppLauncher.openUrl({url: `${infoObject.url}`});
    } else if (infoObject.type_of_info_object === InfoObjectType.TicketMaster) {
      this.goToTicket();
    }
    return;
  }

  clickGoToSponsored(): void {
    AppLauncher.openUrl({url: 'https://spotbie.com/business'});
  }

  async ngAfterViewInit() {
    // I'm sure there's a better way to do this but I don't have time right now.
    const closeButton = document.getElementById('sb-closeButtonInfoObject');

    const isLoggedInRet = await Preferences.get({key: 'spotbie_loggedIn'});
    this.isLoggedIn$.next(isLoggedInRet.value);

    const p =
      this.isLoggedIn$.getValue() === '0' || !this.isLoggedIn$.getValue()
        ? document.getElementById('ionToolbarLoggedOut').offsetHeight
        : document.getElementById('ionToolbarLoggedIn').offsetHeight;

    closeButton.style.top = p + 'px';
  }

  ngOnInit() {
    this.loading$.next(true);

    const infoObject = this.infoObject$.getValue();

    if (infoObject) {
      this.infoObjectCategory = infoObject.type_of_info_object_category;

      switch (infoObject.type_of_info_object) {
        case InfoObjectType.Yelp:
          this.urlApi = YELP_BUSINESS_DETAILS_API + infoObject.id;
          break;
        case InfoObjectType.TicketMaster:
          this.loading$.next(false);
          return;
        case InfoObjectType.SpotBieCommunity:
          this.rewardMenuUp$.next(true);

          if (
            infoObject.user_type === 1 ||
            infoObject.user_type === 2 ||
            infoObject.user_type === 3
          ) {
            this.infoObjectLink = `${environment.baseUrl}community/${infoObject.qr_code_link}`;
            this.objectDisplayAddress$.next(infoObject.address);
            switch (infoObject.user_type) {
              case 1:
                this.infoObjectTitle = `${infoObject.name} - ${infoObject.cleanCategories} - ${infoObject.address}`;
                this.infoObjectDescription = `Let's go eat at ${
                  infoObject.name
                }. They are located at ${this.objectDisplayAddress$.getValue()}.`;
                break;
              case 2:
                this.infoObjectTitle = `${infoObject.name} - ${infoObject.cleanCategories} - ${infoObject.address}`;
                this.infoObjectDescription = `I really recommend you go shopping at ${infoObject.name}!`;
                break;
              case 3:
                this.infoObjectTitle = `${infoObject.name} - ${infoObject.cleanCategories} - ${infoObject.address}`;
                this.infoObjectDescription = `Let's go to ${infoObject.name}!`;
                break;
            }
          }

          this.loading$.next(false);
          return;
      }
    } else {
      if (
        this.router.url.indexOf('shopping') > -1 ||
        this.router.url.indexOf('place-to-eat') > -1 ||
        this.router.url.indexOf('events') > -1
      ) {
        const infoObjectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.urlApi = YELP_BUSINESS_DETAILS_API + infoObjectId;
      }
    }
    this.pullInfoObject();
  }
}
