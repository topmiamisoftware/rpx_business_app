import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeAccountComponent } from './stripe-account.component';

@NgModule({
  declarations: [StripeAccountComponent],
  imports: [
    CommonModule
  ],
  exports: [StripeAccountComponent]
})
export class StripeAccountModule { }
