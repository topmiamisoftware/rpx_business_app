import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {Business} from '../../../models/business';
import {Reward} from '../../../models/reward';
import {
  BusinessMenuServiceService
} from '../../../services/spotbie-logged-in/business-menu/business-menu-service.service';
import {RewardCreatorComponent} from './reward-creator/reward-creator.component';
import {RewardComponent} from './reward/reward.component';
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject} from "rxjs";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";

@Component({
  selector: 'app-reward-menu',
  templateUrl: './reward-menu.component.html',
  styleUrls: ['./reward-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardMenuComponent implements OnInit {

  @ViewChild('rewardCreator') rewardCreator: RewardCreatorComponent
  @ViewChild('appRewardViewer') appRewardViewer: RewardComponent

  @Input() rewardAppFullScreen: boolean = false
  @Input() fullScreenMode: boolean = true
  @Input() loyaltyPoints: string
  @Input() qrCodeLink: string = null

  @Output() closeWindowEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  eAllowedAccountTypes = AllowedAccountTypes
  itemCreator$ = new BehaviorSubject<boolean>(false);
  userPointToDollarRatio$ =  new BehaviorSubject<number>(null);
  rewards$ = new BehaviorSubject<Array<Reward>>([]);
  reward$ = new BehaviorSubject<Reward>(null);
  userType$= new BehaviorSubject<number>(0);
  business$= new BehaviorSubject<Business>(new Business());
  loyaltyPointsBalance$ = new BehaviorSubject<any>(null);
  isLoggedIn$ = new BehaviorSubject<string>(null);
  openTiers$ = new BehaviorSubject(false);

  constructor( private businessMenuService: BusinessMenuServiceService,
              private loyaltyPointsState: BusinessLoyaltyPointsState,
              private router: Router,
              route: ActivatedRoute){
      if(this.router.url.indexOf('business-menu') > -1){
        this.qrCodeLink = route.snapshot.params.qrCode
      }
  }

  async ngOnInit() {
    let userType = await Preferences.get({key: 'spotbie_userType'});
    this.userType$.next(parseInt(userType.value, 10));

    this.isLoggedIn$.next((await Preferences.get({key: 'spotbie_loggedIn'})).value);

    this.getLoyaltyPointBalance();
    this.fetchRewards();
  }

  getLoyaltyPointBalance(){
    this.loyaltyPointsBalance$.next(this.loyaltyPointsState.getState());
  }

  fetchRewards(){
    const fetchRewardsReq = {
      qrCodeLink: null
    }

    this.businessMenuService.fetchRewards(fetchRewardsReq).subscribe(resp => {
        this.fetchRewardsCb(resp)
      })
  }

  private async fetchRewardsCb(resp){
    this.rewards$.next(resp.rewards);

    if(this.userType$.getValue() === this.eAllowedAccountTypes.Personal || this.isLoggedIn$.getValue() !== '1'){
      this.userPointToDollarRatio$.next(resp.loyalty_point_dollar_percent_value);
      this.business$.next(resp.business);
    }
  }

  addItem(){
    this.itemCreator$.next(!this.itemCreator$.getValue());
  }

  closeWindow(){
    this.closeWindowEvt.emit();
  }

  editReward(reward: Reward){
    this.reward$.next(reward);
    this.itemCreator$.next(true);
  }

  closeRewardCreator(){
    this.reward$.next(null);
    this.itemCreator$.next(false);
  }

  closeRewardCreatorAndRefetchRewardList(){
    this.closeRewardCreator();
    this.fetchRewards();
  }

  rewardTileStyling(reward: Reward) {
    if(reward.type === 0)
      return { background: 'url(' + reward.images + ')' }
    else
      return { background: '#64e56f' }
  }

  manageLoyaltyTiers() {
    this.openTiers$.next(true);
  }
}
