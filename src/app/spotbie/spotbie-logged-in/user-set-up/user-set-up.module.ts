import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxMaskDirective, NgxMaskPipe, IConfig, provideNgxMask} from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {QRCodeModule} from "angularx-qrcode";
import {IonicModule} from "@ionic/angular";
import {HelperModule} from "../../../helpers/helper.module";
import { UserSetUpComponent} from "./user-set-up.component";
import {RewardMenuShortModule} from "../reward-menu-short/reward-menu-short.module";
import {QrShortModule} from "../qr-short/qr-short.module";

export const options : Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    UserSetUpComponent
  ],
    imports: [
        CommonModule,
        QrShortModule,
        QRCodeModule,
        ReactiveFormsModule,
        RewardMenuShortModule,
        FormsModule,
        NgxMaskDirective,
        NgxMaskPipe,
        IonicModule,
        HelperModule,
    ],
  exports: [
    UserSetUpComponent
  ],
  providers: [provideNgxMask()],
})
export class UserSetUpModule { }
