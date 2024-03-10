import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MenuLoggedInComponent} from './menu-logged-in.component';
import {SpotbiePipesModule} from '../../spotbie-pipes/spotbie-pipes.module';
import {RouterModule} from '@angular/router';
import {HelperModule} from '../../helpers/helper.module';
import {SettingsModule} from './settings/settings.module';
import {IonicModule} from '@ionic/angular';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {BusinessDashboardModule} from "./business-dashboard/business-dashboard.module";
//import { EventMenuModule } from './event-menu/event-menu.module';

@NgModule({
  declarations: [MenuLoggedInComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SpotbiePipesModule,
    RouterModule,
    HelperModule,
    SettingsModule,
    RouterModule,
    IonicModule.forRoot(),
    FontAwesomeModule,
    BusinessDashboardModule,
    //EventMenuModule
  ],
  exports: [MenuLoggedInComponent],
})
export class MenuLoggedInModule {}
