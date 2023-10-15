import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AdManagerMenuComponent } from './ad-manager-menu.component'
import { AdCreatorComponent } from './ad-creator/ad-creator.component'
import { MatSelectModule } from '@angular/material/select'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AdsModule } from '../../ads/ads.module'

@NgModule({
  declarations: [
    AdManagerMenuComponent,
    AdCreatorComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    AdsModule
  ],
  exports : [
    AdManagerMenuComponent
  ]
})
export class AdManagerModule { }
