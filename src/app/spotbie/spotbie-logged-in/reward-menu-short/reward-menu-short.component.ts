import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Reward} from '../../../models/reward';
import {
  BusinessMenuServiceService
} from '../../../services/spotbie-logged-in/business-menu/business-menu-service.service';
import {RewardComponent} from './reward/reward.component';
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject, of, take} from "rxjs";
import {User} from "../../../models/user";
import {SpotbieUser} from "../../../models/spotbieuser";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {catchError, tap} from "rxjs/operators";
import {LoyaltyPointsService} from "../../../services/loyalty-points/loyalty-points.service";
import {ToastController} from "@ionic/angular";
import {UserForBusiness} from "../user-set-up/user-set-up.component";
import {LoyaltyPointBalance} from "../../../models/loyalty-point-balance";

@Component({
  selector: 'app-reward-menu-short',
  templateUrl: './reward-menu-short.component.html',
  styleUrls: ['./reward-menu-short.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardMenuShortComponent implements OnInit {

  @ViewChild('appRewardViewer') appRewardViewer: RewardComponent

  @Input() userLpInBusiness: {balance: number, balance_aggregate: number};
  @Input() userLp: number;
  @Input() rewardAppFullScreen: boolean = false
  @Input() set user(value: UserForBusiness) {
    this._user = value;
    this.user$.next(value);
  }

  @Output() userAwarded = new EventEmitter();

  rewards$ = new BehaviorSubject<Array<Reward>>([]);
  availableRewards$ = new BehaviorSubject<Array<Reward>>(null);
  isLoggedIn$ = new BehaviorSubject<string>(null);
  user$ = new BehaviorSubject<{user: User, spotbie_user: SpotbieUser}>(null);
  loyaltyPointsBalance$ = new BehaviorSubject<LoyaltyPointBalance>(null);
  _user: {user: User, spotbie_user: SpotbieUser};
  loading$ = new BehaviorSubject<boolean>(false);
  userAwarded$ = new BehaviorSubject<Reward>(null);

  constructor(
    private businessMenuService: BusinessMenuServiceService,
    private loyaltyPointsState: BusinessLoyaltyPointsState,
    private loyaltyPointService: LoyaltyPointsService,
    private toastService: ToastController
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
    this.loading$.next(true);

    const c = confirm(`Are you sure you want to reward this user with "${reward.name}"?`);
    if (!c) {
      this.loading$.next(false);
      return;
    }

    this.loyaltyPointService.redeem(reward, this._user.spotbie_user.id)
      .pipe(
        catchError(async (err) => {
          const toast = await this.toastService.create({
            message: err.error?.message ?? err.message,
            duration: 1500,
            position: 'bottom',
          });
          await toast.present();
          return of(err);
        }),
        tap((resp) => {
          if (resp.success) {
            this.userAwarded$.next(reward);
            this.userAwarded.emit(null);
          } else {
            this.userAwarded$.next(null);
          }
          this.loading$.next(false);
        }),
      ).subscribe();
  }

  seeMenu() {
    this.userAwarded$.next(null);
  }

  fetchRewards() {
    this.loading$.next(true);
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
    if (!tierList) {
      return true;
    }

    const tier = tierList.find((t) => t.id === reward.tier_id);
    if (tier.lp_entrance < this.userLpInBusiness?.balance_aggregate) {
      return true;
    }

    return false;
  }

  userHasEnoughLp(reward: Reward): boolean {
    const balance = this.loyaltyPointsBalance$.getValue();
    let point_cost = (reward.point_cost / balance.loyalty_point_dollar_percent_value) * 100;

    if (reward.is_global) {
      if (point_cost < this.userLp) {
        return true;
      }
    } else {
      if (point_cost < this.userLpInBusiness?.balance) {
        return true;
      }
    }

    return false;
  }

  availableRewards() {
    this.rewards$.pipe(
      take(1),
      tap((rewardList) => {
        const availableRewards = rewardList?.filter((r) => this.userIsInTier(r) && this.userHasEnoughLp(r));
        this.availableRewards$.next(availableRewards ?? []);
        this.loading$.next(false);
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
