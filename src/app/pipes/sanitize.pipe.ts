import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanitize'
})
export class SanitizePipe implements PipeTransform {

  transform(value: string): string {

    let new_text;
    new_text = value.replace(/\\(.)/mg, '$1');
    // console.log("Sanitize pipe : " , new_text);
    return new_text;

  }

}