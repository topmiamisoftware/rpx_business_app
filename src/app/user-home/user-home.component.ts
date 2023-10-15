import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserauthService} from '../services/userauth.service';
import {logOutCallback} from '../helpers/logout-callback';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css'],
})
export class UserHomeComponent implements OnInit {
  @Output() openSettingsEvt = new EventEmitter();

  constructor(private userAuthService: UserauthService) {}

  ngOnInit() {
    this.userAuthService.checkIfLoggedIn().then(resp => {
      if (resp.message === 'not_logged_in') {
        logOutCallback({success: true});
      }
    });
  }
}
