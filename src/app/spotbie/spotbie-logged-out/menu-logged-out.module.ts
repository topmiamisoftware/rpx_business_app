import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MenuLoggedOutComponent} from './menu-logged-out.component';
import {LogInComponent} from './log-in/log-in.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {HelperModule} from '../../helpers/helper.module';
import {IonicModule} from '@ionic/angular';

@NgModule({
  declarations: [MenuLoggedOutComponent, LogInComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    HelperModule,
    FontAwesomeModule,
    IonicModule.forRoot(),
  ],
  exports: [MenuLoggedOutComponent],
})
export class MenuLoggedOutModule {}
