import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyPointsComponent } from './loyalty-points.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
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
    NgxMaskModule.forRoot(options)
  ],
  exports : [
    LoyaltyPointsComponent
  ]
})
export class LoyaltyPointsModule { }
