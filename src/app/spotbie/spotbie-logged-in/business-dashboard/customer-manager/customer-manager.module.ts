import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomerManagerComponent} from './customer-manager.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgxsModule} from '@ngxs/store';
import {RecentGuestsEntitiesState} from './recent-guests/recent-guest.state';
import {NgxsStoragePluginModule} from '@ngxs/storage-plugin';
import {SmsGroupEntitiesState} from './sms-history/sms-group.state';
import {FeedbackEntitiesState} from "./feedback/feedback.state";
import {EmailGroupEntitiesState} from "./email-history/email-group.state";

@NgModule({
  declarations: [CustomerManagerComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FontAwesomeModule,
    NgxsModule.forRoot([
      RecentGuestsEntitiesState,
      SmsGroupEntitiesState,
      FeedbackEntitiesState,
      EmailGroupEntitiesState
    ]),
    NgxsStoragePluginModule.forRoot(),
  ],
  exports: [CustomerManagerComponent],
})
export class CustomerManagerModule {}
