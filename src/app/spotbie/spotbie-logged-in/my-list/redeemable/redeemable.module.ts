import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {RedeemableComponent} from './redeemable.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [RedeemableComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: RedeemableComponent}]),
  ],
})
export class RedeemableModule {}
