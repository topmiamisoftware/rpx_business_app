import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {SpotbiePipesModule} from '../../../spotbie-pipes/spotbie-pipes.module';
import {HelperModule} from '../../../helpers/helper.module';
import {BalancesModule} from './balances/balances.module';
import {RedeemedModule} from './redeemed/redeemed.module';
import {RedeemableModule} from './redeemable/redeemable.module';
import {LedgerModule} from './ledger/ledger.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SpotbiePipesModule,
    HelperModule,
    BalancesModule,
    RedeemedModule,
    RedeemableModule,
    LedgerModule,
    IonicModule,
  ],
  exports: [],
})
export class MyListModule {}
