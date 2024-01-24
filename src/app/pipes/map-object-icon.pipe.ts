import { Pipe, PipeTransform } from '@angular/core'

@Pipe({name: 'mapObjectIcon'})
export class MapObjectIconPipe implements PipeTransform {
  transform(value : string) : string {
    return value
  }
}
