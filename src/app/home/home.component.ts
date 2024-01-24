import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Preferences} from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  getStartedPrompt = true;

  constructor(private router: Router) {}

  /**
   *  Will hide the Get Started screen
   */
  getStarted() {
    this.getStartedPrompt = false;
  }

  /**
   * If the user is logged-in then navigate to the user-home component which holds
   * the business dashboard.
   */
  async checkIfLoggedIn() {
    const ret = await Preferences.get({key: 'spotbie_loggedIn'});
    const isLoggedIn = ret.value;

    if (isLoggedIn === '1') {
      this.router.navigate(['/user-home']);
    }
  }

  ngOnInit() {
    this.checkIfLoggedIn();
  }
}
