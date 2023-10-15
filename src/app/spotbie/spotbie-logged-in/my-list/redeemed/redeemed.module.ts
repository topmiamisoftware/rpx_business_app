import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {RedeemedComponent} from './redeemed.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [RedeemedComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: RedeemedComponent}]),
  ],
})
export class RedeemedModule {}
