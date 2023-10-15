import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LedgerComponent} from './ledger.component';
import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [LedgerComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{path: '', component: LedgerComponent}]),
  ],
})
export class LedgerModule {}
