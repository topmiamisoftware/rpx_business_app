import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { SpotbiePipesModule } from '../../spotbie-pipes/spotbie-pipes.module';
import { MapComponent } from './map.component';
import { MapObjectIconPipe } from '../../pipes/map-object-icon.pipe';
import { HelperModule } from '../../helpers/helper.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserInfoObjectComponent } from './user-info-object/user-info-object.component';
import { RouterModule } from '@angular/router';
import { UserDashboardModule } from '../spotbie-logged-in/user-dashboard/user-dashboard.module';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { InfoObjectModule } from './info-object/info-object.module';
import { AdsModule } from '../ads/ads.module';
import { StopClickPropagationDirective } from '../../directives/stop-click-propagation.directive';
import { GoogleMapsModule } from '@angular/google-maps';
import {IonicModule} from "@ionic/angular";

@NgModule({
  declarations: [MapComponent, UserInfoObjectComponent],
    imports: [
        CommonModule,
        MatSliderModule,
        MatInputModule,
        SpotbiePipesModule,
        ReactiveFormsModule,
        FormsModule,
        ShareIconsModule,
        InfoObjectModule,
        RouterModule,
        HelperModule,
        UserDashboardModule,
        AdsModule,
        GoogleMapsModule,
        IonicModule,
    ],
  providers: [MapObjectIconPipe, StopClickPropagationDirective],
  exports: [MapComponent],
})
export class MapModule {}
