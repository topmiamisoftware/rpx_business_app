import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CustomerManagerComponent} from './customer-manager.component';

@NgModule({
  declarations: [
    CustomerManagerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CustomerManagerComponent
  ],
})
export class CustomerManagerModule { }
