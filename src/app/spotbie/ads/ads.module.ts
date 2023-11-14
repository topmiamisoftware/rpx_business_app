import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CommunityMemberModule } from '../community-member/community-member.module'
import { BottomAdBannerComponent } from './bottom-ad-banner/bottom-ad-banner.component';
import { NearbyFeaturedAdComponent } from './nearby-featured-ad/nearby-featured-ad.component'
import { HeaderAdBannerComponent } from './header-ad-banner/header-ad-banner.component';
import { SpotbiePipesModule } from '../../spotbie-pipes/spotbie-pipes.module';

@NgModule({
  declarations: [
    HeaderAdBannerComponent,
    BottomAdBannerComponent,
    NearbyFeaturedAdComponent
  ],
  imports: [
    CommonModule,
    SpotbiePipesModule,
    CommunityMemberModule
  ],
  exports : [
    HeaderAdBannerComponent,
    BottomAdBannerComponent,
    NearbyFeaturedAdComponent
  ]
})
export class AdsModule { }
