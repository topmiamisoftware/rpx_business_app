import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BalancesComponent} from './balances.component';
import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [BalancesComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: BalancesComponent}]),
  ],
})
export class BalancesModule {}
