import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Ad} from '../../models/ad';
import {Business} from '../../models/business';
import {BusinessMenuServiceService} from '../../services/spotbie-logged-in/business-menu/business-menu-service.service';
import {InfoObject} from '../../models/info-object';
import {BehaviorSubject} from 'rxjs';
import {filter, tap} from 'rxjs/operators';

@Component({
  selector: 'app-community-member',
  templateUrl: './community-member.component.html',
  styleUrls: ['./community-member.component.css'],
})
export class CommunityMemberComponent implements OnInit, OnChanges {
  @Input() lat: number;
  @Input() lng: number;
  @Input() business: Business;
  @Input() ad: Ad;
  @Input() accountType: number = null;
  @Input() categories: number;
  @Input() editMode: boolean = false;
  @Input() eventsClassification: number = null;
  @Input() qrCodeLink: string = null;

  @Output() closeWindowEvt = new EventEmitter();

  loadedBusiness$ = new BehaviorSubject<Business>(null);
  infoObjectLoaded$ = new BehaviorSubject(false);
  fullScreenMode: boolean = false;
  infoObject$ = new BehaviorSubject<InfoObject>(null);

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private businessMenuService: BusinessMenuServiceService,
    private changeDetection: ChangeDetectorRef,
  ) {}

  ngOnChanges() {
    this.changeDetection.markForCheck();
  }

  closeWindow() {
    this.closeWindowEvt.emit();
  }

  getCommunityMember() {
    const getCommunityMemberReqObj = {
      qrCodeLink: this.qrCodeLink,
    };

    this.businessMenuService
      .getCommunityMember(getCommunityMemberReqObj)
      .pipe(
        filter(b => !!b),
        tap(resp => {
          const business = resp.business;
          business.is_community_member = true;
          business.type_of_info_object = 'spotbie_community';
          business.loyalty_point_dollar_percent_value =
            business.loyalty_point_balance.loyalty_point_dollar_percent_value;
          business.rewardRate =
            business.loyalty_point_dollar_percent_value / 100;

          this.loadedBusiness$.next(business);

          const infoObject = new InfoObject();
          infoObject.business = business;
          infoObject.type_of_info_object = business.type_of_info_object;
          infoObject.type_of_info_object_category = this.accountType;
          infoObject.user_type = business.user_type;
          infoObject.is_community_member = business.is_community_member;
          infoObject.categories = business.categories;
          infoObject.description = business.description;
          infoObject.name = business.name;
          infoObject.qr_code_link = business.qr_code_link;
          infoObject.loyalty_point_dollar_percent_value =
            business.loyalty_point_dollar_percent_value;
          infoObject.rewardRate = business.rewardRate;

          this.infoObject$.next(infoObject);

          this.infoObjectLoaded$.next(true);
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    if (this.router.url.indexOf('community') > -1) {
      this.qrCodeLink = this.activatedRoute.snapshot.paramMap.get('qrCode');
      this.fullScreenMode = true;
    }
    this.getCommunityMember();
  }
}
