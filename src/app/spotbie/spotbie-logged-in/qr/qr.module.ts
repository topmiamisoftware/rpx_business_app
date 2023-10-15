import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr.component';

import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RewardMenuModule } from '../reward-menu/reward-menu.module';

export const options : Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    QrComponent
  ],
  imports: [
    CommonModule,
    NgxQRCodeModule,
    ZXingScannerModule,
    ReactiveFormsModule,
    RewardMenuModule,
    FormsModule,
    NgxMaskModule.forRoot(options)  
  ],
  exports: [
    QrComponent
  ]
})
export class QrModule { }
