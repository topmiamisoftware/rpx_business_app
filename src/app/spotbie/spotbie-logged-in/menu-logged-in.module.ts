import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DeviceDetectorService } from 'ngx-device-detector'
import { HttpClientModule } from '@angular/common/http'
import { MenuLoggedInComponent } from './menu-logged-in.component'
import { SpotbiePipesModule } from 'src/app/spotbie-pipes/spotbie-pipes.module'
import { RouterModule } from '@angular/router'
import { HelperModule } from 'src/app/helpers/helper.module'
import { MapModule } from '../map/map.module'
import { SettingsModule } from './settings/settings.module';
import { RedeemableModule } from './redeemable/redeemable.module';
// import { EventMenuModule } from './event-menu/event-menu.module'

@NgModule({
  declarations: [
    MenuLoggedInComponent,
  ],
  imports: [
    RedeemableModule,
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
    // EventMenuModule
  ],
  providers: [
    DeviceDetectorService
  ],
  exports: [
    MenuLoggedInComponent
  ]
})
export class MenuLoggedInModule { }
