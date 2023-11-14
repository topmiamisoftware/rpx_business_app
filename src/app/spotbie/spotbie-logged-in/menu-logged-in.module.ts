import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MenuLoggedInComponent} from './menu-logged-in.component';
import {SpotbiePipesModule} from '../../spotbie-pipes/spotbie-pipes.module';
import {RouterModule} from '@angular/router';
import {HelperModule} from '../../helpers/helper.module';
import {MapModule} from '../map/map.module';
import {SettingsModule} from './settings/settings.module';
import {IonicModule} from '@ionic/angular';
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
    MapModule,
    SettingsModule,
    RouterModule,
    IonicModule.forRoot(),
    //EventMenuModule
  ],
  exports: [MenuLoggedInComponent],
})
export class MenuLoggedInModule {}
