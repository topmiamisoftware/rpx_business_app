import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardMenuShortComponent } from './reward-menu-short.component';
import { RewardComponent } from './reward/reward.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelperModule } from '../../../helpers/helper.module';
import { QRCodeModule } from "angularx-qrcode";
import {IonicModule} from "@ionic/angular";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {SpotbiePipesModule} from "../../../spotbie-pipes/spotbie-pipes.module";
import { NgxMaskPipe} from "ngx-mask";
import {NgxMaskDirective} from "ngx-mask";

@NgModule({
  declarations: [
    RewardMenuShortComponent,
    RewardComponent,
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
  ],
  exports : [
    RewardMenuShortComponent
  ]
})
export class RewardMenuShortModule { }
