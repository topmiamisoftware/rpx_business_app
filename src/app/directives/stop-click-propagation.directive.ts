import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[SpotBieStopClickPropagation]'
})
export class StopClickPropagationDirective {

  @HostListener("click", ["$event"])
  onClick(event: any): void
  {
    event.stopPropagation();
  }
}


