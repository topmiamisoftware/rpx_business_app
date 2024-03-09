import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardMenuComponent } from './reward-menu.component';
import { RewardComponent } from './reward/reward.component';
import { RewardCreatorComponent } from './reward-creator/reward-creator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelperModule } from '../../../helpers/helper.module';
import { QRCodeModule } from "angularx-qrcode";
import {IonicModule} from "@ionic/angular";
import {TierCreatorComponent} from "./tier-creator/tier-creator.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";

@NgModule({
  declarations: [
    RewardMenuComponent,
    RewardComponent,
    RewardCreatorComponent,
    TierCreatorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    HelperModule,
    IonicModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  exports : [
    RewardMenuComponent
  ]
})
export class RewardMenuModule { }
