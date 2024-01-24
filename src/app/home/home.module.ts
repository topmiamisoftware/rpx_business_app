import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {RouterModule, Routes} from '@angular/router';
import {MenuModule} from '../spotbie/menu.module';
import {SpotbiePipesModule} from '../spotbie-pipes/spotbie-pipes.module';
import {MapModule} from '../spotbie/map/map.module';
import {HelperModule} from '../helpers/helper.module';
import {MenuLoggedOutModule} from '../spotbie/spotbie-logged-out/menu-logged-out.module';
import {WelcomeModule} from '../spotbie/welcome/welcome.module';
import {MenuLoggedInModule} from '../spotbie/spotbie-logged-in/menu-logged-in.module';
import {MenuLoggedInComponent} from '../spotbie/spotbie-logged-in/menu-logged-in.component';
import {IonicModule} from '@ionic/angular';

const routes: Routes = [{path: '', component: HomeComponent}];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    MenuLoggedInModule,
    MenuLoggedOutModule,
    MenuModule,
    MapModule,
    HelperModule,
    WelcomeModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  exports: [HomeComponent, MenuLoggedInComponent, MenuLoggedOutModule],
})
export class HomeModule {}
