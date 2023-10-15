import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InfoObjectComponent} from './info-object.component';
import {ShareButtonsModule} from 'ngx-sharebuttons/buttons';
import {RewardMenuModule} from '../../spotbie-logged-in/reward-menu/reward-menu.module';
import {NearbyAdsThreeComponent} from './nearby-ads-three/nearby-ads-three.component';
import {NearbyFeaturedAdComponent} from './nearby-featured-ad/nearby-featured-ad.component';
import {HelperModule} from '../../../helpers/helper.module';
import {IonicModule} from "@ionic/angular";

@NgModule({
  declarations: [
    InfoObjectComponent,
    NearbyAdsThreeComponent,
    NearbyFeaturedAdComponent,
  ],
    imports: [
        CommonModule,
        RewardMenuModule,
        HelperModule,
        ShareButtonsModule.withConfig({
            include: [
                'facebook',
                'twitter',
                'linkedin',
                'reddit',
                'tumblr',
                'mix',
                'viber',
                'messenger',
                'whatsapp',
            ],
        }),
        IonicModule,
    ],
  exports: [InfoObjectComponent],
})
export class InfoObjectModule {}
