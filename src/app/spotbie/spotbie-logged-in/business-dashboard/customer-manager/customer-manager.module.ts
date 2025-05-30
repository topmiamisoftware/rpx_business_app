import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomerManagerComponent} from './customer-manager.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgxsModule} from '@ngxs/store';
import {RecentGuestsEntitiesState} from './recent-guests/recent-guest.state';
import {NgxsStoragePluginModule} from '@ngxs/storage-plugin';
import {SmsGroupEntitiesState} from './sms-history/sms-group.state';
import {FeedbackEntitiesState} from "./feedback/feedback.state";
import {EmailGroupEntitiesState} from "./email-history/email-group.state";
import {IonicModule} from "@ionic/angular";

@NgModule({
  declarations: [CustomerManagerComponent],
    imports: [
        CommonModule,
        FontAwesomeModule,
        NgxsModule.forRoot([
            RecentGuestsEntitiesState,
            SmsGroupEntitiesState,
            FeedbackEntitiesState,
            EmailGroupEntitiesState
        ]),
        NgxsStoragePluginModule.forRoot(),
        IonicModule,
    ],
  exports: [CustomerManagerComponent],
})
export class CustomerManagerModule {}
