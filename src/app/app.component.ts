import {
  Component,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { VersionCheckService } from './services/version-check.service';
import { environment } from '../environments/environment.prod';
import { SpotbieMetaService } from './services/meta/spotbie-meta.service';
import {
  spotbieMetaDescription,
  spotbieMetaTitle,
  spotbieMetaImage,
} from './constants/spotbie';

const SPOTBIE_META_DESCRIPTION = spotbieMetaDescription;
const SPOTBIE_META_TITLE = spotbieMetaTitle;
const SPOTBIE_META_IMAGE = spotbieMetaImage;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'spotbie';

  constructor(
      private versionCheckService: VersionCheckService,
      private spotbieMetaService: SpotbieMetaService
  ) {}

  @HostListener('window:load', [])
  onWindowLoaded() {
    this.versionCheckService.initVersionCheck(environment.versionCheckURL);
  }

  ngOnInit() {
    this.spotbieMetaService.setTitle(SPOTBIE_META_TITLE);
    this.spotbieMetaService.setDescription(SPOTBIE_META_DESCRIPTION);
    this.spotbieMetaService.setImage(SPOTBIE_META_IMAGE);
  }
}
