import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
  @Output() getStartedEvt = new EventEmitter();

  constructor() {}

  getStarted() {
    this.getStartedEvt.emit();
  }

  ngOnInit(): void {}
}
