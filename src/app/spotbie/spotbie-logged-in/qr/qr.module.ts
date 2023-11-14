import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrComponent } from './qr.component';
import {NgxMaskDirective, NgxMaskPipe, IConfig, provideNgxMask} from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RewardMenuModule } from '../reward-menu/reward-menu.module';
import {QRCodeModule} from "angularx-qrcode";

export const options : Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    QrComponent
  ],
  imports: [
    CommonModule,
    QRCodeModule,
    ReactiveFormsModule,
    RewardMenuModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  exports: [
    QrComponent
  ],
  providers: [provideNgxMask()],
})
export class QrModule { }
