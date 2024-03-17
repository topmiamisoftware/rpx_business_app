import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum'
import {Business} from '../../../models/business'
import {Reward} from '../../../models/reward'
import {
  BusinessMenuServiceService
} from '../../../services/spotbie-logged-in/business-menu/business-menu-service.service'
import {RewardCreatorComponent} from './reward-creator/reward-creator.component'
import {RewardComponent} from './reward/reward.component'
import {environment} from '../../../../environments/environment'
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject} from "rxjs";
import {UserauthService} from "../../../services/userauth.service";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {BusinessMembership} from "../../../models/user";
import {map} from "rxjs/operators";

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
  rewardApp$ = new BehaviorSubject<boolean>(false);
  userPointToDollarRatio$ =  new BehaviorSubject<number>(null);
  rewards$ = new BehaviorSubject<Array<Reward>>([]);
  reward$ = new BehaviorSubject<Reward>(null);
  userType$= new BehaviorSubject<number>(0);
  business$= new BehaviorSubject<Business>(new Business());
  loyaltyPointsBalance$ = new BehaviorSubject<any>(null);
  isLoggedIn$ = new BehaviorSubject<string>(null);
  showCreate$ = new BehaviorSubject<boolean>(false);
  openTiers$ = new BehaviorSubject(false);
  user$ = this.userService.userProfile$;
  canUseTiers$ = this.user$.pipe(
    map(
      user =>
        user.userSubscriptionPlan === BusinessMembership.Legacy ||
        user.userSubscriptionPlan === BusinessMembership.Intermediate ||
        user.userSubscriptionPlan === BusinessMembership.Ultimate
    )
  );

  constructor( private businessMenuService: BusinessMenuServiceService,
              private loyaltyPointsState: BusinessLoyaltyPointsState,
              private router: Router,
              private userService: UserauthService,
              route: ActivatedRoute){
      if(this.router.url.indexOf('business-menu') > -1){
        this.qrCodeLink = route.snapshot.params.qrCode
      }
  }

  async ngOnInit() {
    let userType = await Preferences.get({key: 'spotbie_userType'});
    this.userType$.next(parseInt(userType.value, 10));

    this.isLoggedIn$.next((await Preferences.get({key: 'spotbie_loggedIn'})).value);

    if( this.userType$.getValue() !== this.eAllowedAccountTypes.Personal) {
      this.getLoyaltyPointBalance();
      this.fetchRewards();
    } else {
      this.fetchRewards(this.qrCodeLink);
    }
  }

  getWindowClass(){
    if(this.fullScreenMode)
      return 'spotbie-overlay-window'
    else
      return ''
  }

  getLoyaltyPointBalance(){
    this.loyaltyPointsBalance$.next(this.loyaltyPointsState.getState());
  }

  fetchRewards(qrCodeLink: string = null){
    const fetchRewardsReq = {
      qrCodeLink: this.qrCodeLink
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
    if(this.loyaltyPointsBalance$.getValue().balance === 0){
      this.notEnoughLpEvt.emit();
      this.closeWindow();
      return;
    }

    this.itemCreator$.next(!this.itemCreator$.getValue());
  }

  closeWindow(){
    this.closeWindowEvt.emit();
  }

  openReward(reward: Reward){
    this.reward$.next(reward);
    this.reward$.getValue().link = `${environment.baseUrl}business-menu/${this.qrCodeLink}/${this.reward$.getValue().uuid}`
    this.rewardApp$.next(true);
  }

  closeReward(){
    this.reward$.next(null);
    this.rewardApp$.next(false);
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
