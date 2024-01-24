/**
 * This component is used for the welcome screen that holds the "Get Started" button which is
 * displayed as soon as you open the SpotBie app.
 */

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
