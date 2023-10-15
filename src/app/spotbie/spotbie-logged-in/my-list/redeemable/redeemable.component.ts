import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterViewInit,
} from '@angular/core';
import {AllowedAccountTypes} from '../../../../helpers/enum/account-type.enum';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {Redeemable} from '../../../../models/redeemable';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {Preferences} from "@capacitor/preferences";
import {filter} from "rxjs/operators";
import {LoadingController} from "@ionic/angular";

@Component({
  selector: 'app-redeemable',
  templateUrl: './redeemable.component.html',
  styleUrls: ['./redeemable.component.css', '../my-list.component.css'],
})
export class RedeemableComponent implements OnInit {
  @Output() closeWindowEvt = new EventEmitter();

  rewards$ = new BehaviorSubject<boolean>(false);
  rewardList$ = new BehaviorSubject<Array<Redeemable>>([]);
  rewardPage$ = new BehaviorSubject<number>(1);
  rewardTotal$ = new BehaviorSubject<number>(0);
  loadMore$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(false);
  loader: HTMLIonLoadingElement;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private loadingCtrl: LoadingController
  ) {
    this.initLoading();
  }

  ngOnInit() {
    this.rewards$.next(true);
    this.getRewards();
  }

  initLoading() {
    this.loading$
      .pipe(filter(loading => loading !== undefined))
      .subscribe(async loading => {
        if (loading) {
          this.loader = await this.loadingCtrl.create({
            message: 'LOADING...',
          });
          this.loader.present();
        } else {
          if (this.loader) {
            this.loader.dismiss();
            this.loader = null;
          }
        }
      });
  }

  loadMoreItems() {
    if (this.rewards$.getValue()) {
      this.rewardPage$.next(this.rewardPage$.getValue() + 1);
      this.getRewards();
    }
  }

  getRewards() {
    this.loading$.next(true);

    const getRewardsObj = {
      page: this.rewardPage$.getValue(),
    };

    this.loyaltyPointsService.getRewards(getRewardsObj).subscribe({
      next: resp => {
        const rewardList: Redeemable[] = resp.rewardList.data;

        this.rewardTotal$.next(rewardList.length);

        const currentPage = resp.rewardList.current_page;
        const lastPage = resp.rewardList.last_page;

        this.rewardPage$.next(currentPage);

        this.rewardPage$.getValue() === lastPage
          ? this.loadMore$.next(false)
          : this.loadMore$.next(true);

        rewardList.forEach((redeemItem: Redeemable) => {
          this.rewardList$.next([...this.rewardList$.getValue(), redeemItem]);
        });

        this.rewards$.next(true);

        this.loading$.next(false);
      },
      error: error => {
        console.log('getRewards', error);
      },
    });
  }

  showLoadMore() {
    if (this.rewards$.getValue() && this.rewardTotal$.getValue() > 0) {
      return true;
    }
  }

  closeWindow() {
    this.closeWindowEvt.emit();
  }
}
