import { Component, Input, OnInit } from '@angular/core';
import { SpEvent } from '../../../../models/event';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  @Input('event') event: SpEvent

  public loading: boolean = false

  constructor() { }

  public deleteMe(){
    
  }

  ngOnInit(): void {
    console.log('reward_is', this.event)
  }

}
