import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrShortComponent } from './qr-short.component';
import {NgxMaskDirective, NgxMaskPipe, IConfig, provideNgxMask} from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RewardMenuModule } from '../reward-menu/reward-menu.module';
import {QRCodeModule} from "angularx-qrcode";
import {IonicModule} from "@ionic/angular";

export const options : Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    QrShortComponent
  ],
    imports: [
        CommonModule,
        QRCodeModule,
        ReactiveFormsModule,
        RewardMenuModule,
        FormsModule,
        NgxMaskDirective,
        NgxMaskPipe,
        IonicModule,
    ],
  exports: [
    QrShortComponent
  ],
  providers: [provideNgxMask()],
})
export class QrShortModule { }
