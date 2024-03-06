import {NgxsDataRepository} from '@angular-ru/ngxs/repositories';
import {
  Computed,
  DataAction,
  Payload,
  StateRepository,
} from '@angular-ru/ngxs/decorators';
import {Injectable} from '@angular/core';
import {State} from '@ngxs/store';
import {Observable, tap} from 'rxjs';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {RewardCreatorService} from '../../../services/spotbie-logged-in/business-menu/reward-creator/reward-creator.service';
import {map} from 'rxjs/operators';

@StateRepository()
@State({
  name: 'loyalty_points',
  defaults: {},
})
@Injectable()
export class LoyaltyPointsState extends NgxsDataRepository<number> {
  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private rewardService: RewardCreatorService
  ) {
    super();
  }

  @Computed()
  get balance$(): Observable<number> {
    return this.state$.pipe(map(m => m));
  }

  @DataAction()
  setLoyaltyPoints(@Payload('loyalty_points') loyalty_points: number) {
    this.ctx.setState(loyalty_points);
  }

  getLoyaltyPointBalance(): Observable<any> {
    return this.loyaltyPointsService.getLoyaltyPointBalance().pipe(
      tap((response: {success: boolean; loyalty_points: number}) => {
        this.setState(response.loyalty_points);
      })
    );
  }
}
