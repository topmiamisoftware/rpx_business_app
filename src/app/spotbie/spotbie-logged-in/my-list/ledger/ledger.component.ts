import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {LoyaltyPointsLedger} from '../../../../models/loyalty-points-ledger';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {filter} from 'rxjs/operators';
import {LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.scss', '../my-list.component.css'],
})
export class LedgerComponent implements OnInit {
  ledger$ = new BehaviorSubject<boolean>(false);
  lpLedgerList$ = new BehaviorSubject<Array<LoyaltyPointsLedger>>([]);
  lpLedgerPage$ = new BehaviorSubject<number>(1);
  lpLedgerTotal$ = new BehaviorSubject<number>(0);
  loadMore$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(false);
  loader: HTMLIonLoadingElement;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private loadingCtrl: LoadingController
  ) {
    this.initLoading();
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

  ngOnInit() {
    this.ledger$.next(true);
    this.getLedger();
  }

  showLoadMore() {
    if (this.ledger$.getValue() && this.lpLedgerTotal$.getValue() > 0) {
      return true;
    }
  }

  loadMoreItems() {
    this.lpLedgerPage$.next(this.lpLedgerPage$.getValue() + 1);
    this.getLedger();
  }

  getLedger() {
    this.loading$.next(true);

    const getLedgerObj = {
      page: this.lpLedgerPage$.getValue(),
    };

    this.loyaltyPointsService.getLedger(getLedgerObj).subscribe({
      next: resp => {
        const ledgerData: LoyaltyPointsLedger[] = resp.ledger.data;

        this.lpLedgerTotal$.next(ledgerData.length);

        const currentPage = resp.ledger.current_page;
        const lastPage = resp.ledger.last_page;

        this.lpLedgerPage$.next(currentPage);

        this.lpLedgerPage$.getValue() === lastPage
          ? this.loadMore$.next(false)
          : this.loadMore$.next(true);

        ledgerData.forEach((ledgerRecord: LoyaltyPointsLedger) => {
          this.lpLedgerList$.next([
            ...this.lpLedgerList$.getValue(),
            ledgerRecord,
          ]);
        });

        this.loading$.next(false);
      },
      error: error => {
        console.log('getLedger', error);
      },
    });
  }

  getLpStyle(lpPoints: number) {
    if (lpPoints < 0) {
      return 'sb-text-red-gradient';
    } else {
      return 'sb-text-light-green-gradient';
    }
  }
}
