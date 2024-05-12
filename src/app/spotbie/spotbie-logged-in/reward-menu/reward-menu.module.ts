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
import {SpotbiePipesModule} from "../../../spotbie-pipes/spotbie-pipes.module";
import {NgxMaskDirective, NgxMaskPipe} from "ngx-mask";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

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
        SpotbiePipesModule,
        IonicModule,
        MatFormFieldModule,
        MatSelectModule,
        NgxMaskDirective,
        NgxMaskPipe,
        MatSlideToggleModule,
    ],
  exports : [
    RewardMenuComponent
  ]
})
export class RewardMenuModule { }
