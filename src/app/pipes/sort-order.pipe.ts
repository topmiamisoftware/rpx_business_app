import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortOrderPipe'
})
export class SortOrderPipe implements PipeTransform {

  transform(value: string): string {

    if(value == 'asc')
        return 'fas fa-arrow-up'
    else
        return 'fas fa-arrow-down'
    
  }

}