import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MakePaymentComponent } from './make-payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { StripeModule } from 'stripe-angular';
import { HelperModule } from '../helpers/helper.module';

export const ROUTES: Routes = [
  { path: ':paymentType/:uuid', component: MakePaymentComponent }
]

@NgModule({
  declarations: [
    MakePaymentComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,    
    CommonModule,
    HelperModule,
    RouterModule.forChild(ROUTES),   
    StripeModule
  ],
  exports : [
    MakePaymentComponent
  ]
})
export class MakePaymentModule { }
