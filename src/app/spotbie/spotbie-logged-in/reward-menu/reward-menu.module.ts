import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardMenuComponent } from './reward-menu.component';
import { RewardComponent } from './reward/reward.component';
import { RewardCreatorComponent } from './reward-creator/reward-creator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelperModule } from '../../../helpers/helper.module';
import { QRCodeModule } from "angularx-qrcode";
import {IonicModule} from "@ionic/angular";

@NgModule({
  declarations: [
    RewardMenuComponent,
    RewardComponent,
    RewardCreatorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    HelperModule,
    IonicModule,
  ],
  exports : [
    RewardMenuComponent
  ]
})
export class RewardMenuModule { }
