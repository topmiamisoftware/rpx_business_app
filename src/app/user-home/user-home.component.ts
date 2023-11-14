import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css'],
})
export class UserHomeComponent {
  @Output() openSettingsEvt = new EventEmitter();

  constructor() {}
}
