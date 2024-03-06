/* Angular Packages */
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatChipsModule } from '@angular/material/chips'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import {NgxMaskDirective, NgxMaskPipe, IConfig, provideNgxMask} from 'ngx-mask';
import { SettingsComponent } from './settings.component'
import { HelperModule } from '../../../helpers/helper.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatIconModule} from "@angular/material/icon";
import {IonicModule} from "@ionic/angular";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

export const options : Partial<IConfig> | (() => Partial<IConfig>) = null

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HelperModule,
    RouterModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatFormFieldModule,
    NgxMaskDirective,
    NgxMaskPipe,
    IonicModule,
    FontAwesomeModule,
    MatSlideToggleModule,
  ],
  exports: [
    SettingsComponent
  ],
  providers: [provideNgxMask()],
})
export class SettingsModule { }
