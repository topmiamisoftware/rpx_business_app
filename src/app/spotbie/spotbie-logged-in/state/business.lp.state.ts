import {NgxsDataRepository} from '@angular-ru/ngxs/repositories';
import {
  Computed,
  StateRepository,
} from '@angular-ru/ngxs/decorators';
import {Injectable} from '@angular/core';
import {State} from '@ngxs/store';
import {Observable, tap} from 'rxjs';
import {LoyaltyPointBalance} from '../../../models/loyalty-point-balance';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {map} from 'rxjs/operators';

@StateRepository()
@State({
  name: 'business_loyalty_points',
  defaults: {},
})
@Injectable()
export class BusinessLoyaltyPointsState extends NgxsDataRepository<LoyaltyPointBalance> {
  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
  ) {
    super();
  }

  @Computed()
  get balance$(): Observable<number> {
    return this.state$.pipe(map(m => m.balance));
  }

  getBusinessLoyaltyPointBalance(): Observable<any> {
    return this.loyaltyPointsService.getLoyaltyPointBalance().pipe(
      tap(
        (response: {success: boolean; loyalty_points: LoyaltyPointBalance}) => {
          console.log('GET RESPONSE BUSINESS', response);
          this.setState(response.loyalty_points);
        }
      )
    );
  }
}
