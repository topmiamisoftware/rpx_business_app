import { Pipe, PipeTransform } from '@angular/core';
import * as spotbieGlobals from '../globals';

const SPOTBIE_TOP_DOMAIN = spotbieGlobals.RESOURCES;

@Pipe({
  name: 'albumMediaPath'
})
export class AlbumMediaUploadPipe implements PipeTransform {

  transform(extra_media_path: string): string {
    return extra_media_path;
  }

}
