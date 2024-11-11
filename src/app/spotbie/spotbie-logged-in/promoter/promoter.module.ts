import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PromoterComponent} from "./promoter.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {HelperModule} from "../../../helpers/helper.module";
import {RouterModule, Routes} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {UserSetUpModule} from "../user-set-up/user-set-up.module";
import {RewardMenuModule} from "../reward-menu/reward-menu.module";

const routes: Routes = [{path: '', component: PromoterComponent}];

@NgModule({
  declarations: [
    PromoterComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HelperModule,
        RouterModule.forChild(routes),
        IonicModule,
        UserSetUpModule,
        RewardMenuModule,
    ],
  exports: [
    PromoterComponent
  ]
})
export class PromoterModule { }
