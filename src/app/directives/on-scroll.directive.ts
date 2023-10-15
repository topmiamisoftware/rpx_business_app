import { Directive, HostListener, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[spotbieOnScroll]'
})
export class OnScrollDirective {

  @Output() spotbieOnScroll: EventEmitter<any> = new EventEmitter();

  @HostListener("scroll", ["$event"])
  public onScroll(event : any): void
  {
    this.spotbieOnScroll.emit(event)
  }

}
