import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyPointsComponent } from './loyalty-points.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxMaskDirective, NgxMaskPipe, IConfig, provideNgxMask} from 'ngx-mask';
import { HelperModule } from '../../../helpers/helper.module';
import { MatDialogModule } from '@angular/material/dialog';

export const options : Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    LoyaltyPointsComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    HelperModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  exports : [
    LoyaltyPointsComponent
  ],
  providers: [provideNgxMask()],
})
export class LoyaltyPointsModule { }
