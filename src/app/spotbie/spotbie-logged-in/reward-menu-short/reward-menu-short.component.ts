import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Reward} from '../../../models/reward';
import {
  BusinessMenuServiceService
} from '../../../services/spotbie-logged-in/business-menu/business-menu-service.service';
import {RewardComponent} from './reward/reward.component';
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject, take} from "rxjs";
import {User} from "../../../models/user";
import {SpotbieUser} from "../../../models/spotbieuser";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {tap} from "rxjs/operators";
import {LoyaltyPointsService} from "../../../services/loyalty-points/loyalty-points.service";

@Component({
  selector: 'app-reward-menu-short',
  templateUrl: './reward-menu-short.component.html',
  styleUrls: ['./reward-menu-short.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardMenuShortComponent implements OnInit {

  @ViewChild('appRewardViewer') appRewardViewer: RewardComponent

  @Input() userLpInBusiness: number;
  @Input() userLp: number;
  @Input() rewardAppFullScreen: boolean = false
  @Input() set user(value: {user: User, spotbie_user: SpotbieUser}) {
    this._user = value;
    this.user$.next(value);
  }

  rewards$ = new BehaviorSubject<Array<Reward>>([]);
  availableRewards$ = new BehaviorSubject<Array<Reward>>([]);
  isLoggedIn$ = new BehaviorSubject<string>(null);
  user$ = new BehaviorSubject<{user: User, spotbie_user: SpotbieUser}>(null);
  loyaltyPointsBalance$ = new BehaviorSubject<any>(null);
  _user: {user: User, spotbie_user: SpotbieUser};

  constructor(
    private businessMenuService: BusinessMenuServiceService,
    private loyaltyPointsState: BusinessLoyaltyPointsState,
    private loyaltyPointService: LoyaltyPointsService,
  ) {
    this.getLoyaltyPointBalance();
    this.loyaltyPointService.getExistingTiers().subscribe();
  }

  getLoyaltyPointBalance(){
    this.loyaltyPointsBalance$.next(this.loyaltyPointsState.getState());
  }

  async ngOnInit() {
    this.isLoggedIn$.next((await Preferences.get({key: 'spotbie_loggedIn'})).value);

    this.fetchRewards();
  }

  rewardUser(reward: Reward) {

  }

  fetchRewards() {
    const fetchRewardsReq = {
      qrCodeLink: null
    }

    this.businessMenuService.fetchRewards(fetchRewardsReq).subscribe(resp => {
        this.fetchRewardsCb(resp)
      });
  }

  private async fetchRewardsCb(resp){
    this.rewards$.next(resp.rewards);
    this.availableRewards();
  }

  userIsInTier(reward: Reward): boolean {
    if (!reward?.tier_id) {
      return true;
    }

    const tierList = this.loyaltyPointService.existingTiers$.getValue();
    console.log('TIER LIST', tierList, 'REWARD', reward);
    if (!tierList) {
      return true;
    }

    const tier = tierList.find((t) => t.id === reward.tier_id);
    if (tier.lp_entrance < this.userLpInBusiness) {
      return true;
    }

    return false;
  }

  userHasEnoughLp(reward: Reward): boolean {
    if (reward.is_global) {
      if (reward.point_cost < this.userLp) {
        return true;
      }
    } else {
      if (reward.point_cost < this.userLpInBusiness) {
        return true;
      }
    }

    return false;
  }

  availableRewards() {
    this.rewards$.pipe(
      take(1),
      tap((rewardList) => {
        const availableRewards = rewardList.filter((r) => this.userIsInTier(r) && this.userHasEnoughLp(r));
        console.log('TJE AVAILABLE REWARDS', availableRewards);
        this.availableRewards$.next(availableRewards);
      }),
    ).subscribe();
  }

  rewardTileStyling(reward: Reward) {
    if(reward.type === 0)
      return { background: 'url(' + reward.images + ')' }
    else
      return { background: '#64e56f' }
  }
}
