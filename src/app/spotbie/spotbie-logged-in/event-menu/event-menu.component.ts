import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {EventCreatorComponent} from './event-creator/event-creator.component'
import {Preferences} from "@capacitor/preferences";
import {Reward} from "../../../models/reward";
import {Business} from "../../../models/business";
import {LoyaltyPointBalance} from "../../../models/loyalty-point-balance";
import {
  BusinessMenuServiceService
} from "../../../services/spotbie-logged-in/business-menu/business-menu-service.service";
import {AllowedAccountTypes} from "../../../helpers/enum/account-type.enum";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-event-menu',
  templateUrl: './event-menu.component.html',
  styleUrls: ['./event-menu.component.css']
})
export class EventMenuComponent implements OnInit {

  @ViewChild('eventCreator') eventCreator: EventCreatorComponent

  @Input() fullScreenWindow: boolean = true
  @Input() loyaltyPoints: string

  @Output() closeWindowEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  itemCreator: boolean = false
  userPointToDollarRatio
  rewards: Array<Reward>
  reward: Reward
  qrCodeLink: string = null
  userHash: string = null
  userType: number = null
  business: Business = new Business()
  loyaltyPointsBalance$ = new BehaviorSubject<LoyaltyPointBalance>(null);

  constructor(private loyaltyPointBalanceState: BusinessLoyaltyPointsState,
              private businessMenuService: BusinessMenuServiceService,
              private router: Router,
              route: ActivatedRoute){
      if (this.router.url.indexOf('business-menu') > -1) {
        this.qrCodeLink = route.snapshot.params.qrCode;
        this.userHash   = route.snapshot.params.userHash;
      }
  }

  getLoyaltyPointBalance(){
    this.loyaltyPointsBalance$.next(this.loyaltyPointBalanceState.getState());
  }

  fetchRewards(qrCodeLink: string = null, userHash: string = null){
    let fetchRewardsReq = null;

    if(qrCodeLink !== null && userHash !== null){
      fetchRewardsReq = {
        qrCodeLink: qrCodeLink,
        userHash: userHash
      };
    }

    this.businessMenuService.fetchRewards(fetchRewardsReq).subscribe(resp => {
        this.fetchRewardsCb(resp)
    });
  }

  private fetchRewardsCb(resp){
    if(resp.success){
      this.rewards = resp.rewards;

      if(this.userType === AllowedAccountTypes.Personal){
        this.userPointToDollarRatio = resp.loyalty_point_dollar_percent_value;
        this.business.name = resp.placeToEatName;
      }
    }
  }

  addEvent(){
    this.itemCreator = !this.itemCreator;
  }

  closeWindow(){
    this.closeWindowEvt.emit();
  }

  placeToEatTileStyling(reward: Reward) {
    if (reward.type === 0) {
      return {'background': 'url(' + reward.images + ')'};
    } else {
      return {'background': 'linear-gradient(90deg,#35a99f,#64e56f)'};
    }
  }

  async ngOnInit() {
    let userType = await Preferences.get({key: 'spotbie_userType'});
    this.userType = parseInt(userType.value, 10);

    this.getLoyaltyPointBalance();
    this.fetchRewards();
  }
}
