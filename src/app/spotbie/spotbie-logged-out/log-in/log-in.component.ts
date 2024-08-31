import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {UserauthService} from '../../../services/userauth.service';
import {Router} from '@angular/router';
import {MenuLoggedOutComponent} from '../menu-logged-out.component';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {BehaviorSubject} from 'rxjs';
import {LoadingController} from '@ionic/angular';
import {filter} from 'rxjs/operators';
import {Preferences} from '@capacitor/preferences';

@Component({
  selector: ' app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['../../menu.component.css', './log-in.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent implements OnInit {
  @ViewChild('spotbieSignUpIssues') spotbieSignUpIssues: ElementRef;

  faEye = faEye;
  faEyeSlash = faEyeSlash;
  loading$ = new BehaviorSubject<boolean>(undefined);
  loader: HTMLIonLoadingElement;
  current_login_username: string;
  logInForm: UntypedFormGroup;
  submitted$ = new BehaviorSubject<boolean>(false);
  rememberMeToken: string;
  passwordShow: boolean = false;
  business: boolean = false;

  constructor(
    private host: MenuLoggedOutComponent = null,
    private formBuilder: UntypedFormBuilder,
    private userAuthService: UserauthService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {
    this.initLoading();
  }

  ngOnInit() {
    this.initLogInForm();
    this.checkTokenLogin();
  }

  async checkTokenLogin() {
    const retLastUsername = await Preferences.get({
      key: 'spotbie_lastLoggedUserName',
    });
    this.current_login_username = retLastUsername.value;

    const retRememberMe = await Preferences.get({key: 'spotbie_rememberMe'});
    const rememberMe = retRememberMe.value;

    const retIsLoggedIn = await Preferences.get({key: 'spotbie_loggedIn'});
    const isLoggedIn = retIsLoggedIn.value;

    if (rememberMe === '1' && isLoggedIn !== '1') {
      this.initTokenLogin();
    }
  }

  /**
   * Shows and hide the password text.
   */
  togglePassword() {
    this.passwordShow = !this.passwordShow;
  }

  /**
   * Will log the user in.
   * @param userLogin
   * @param userPass
   * @param userRememberMe
   * @param userReMemberMeToken
   */
  loginUser(userLogin: string, userPass: string, userRememberMe: string) {
    this.userAuthService
      .initLogin(userLogin, userPass, userRememberMe)
      .subscribe(
        resp => {
          this.loginCallback(resp);
        },
        e => {
          this.loading$.next(false);

          this.spotbieSignUpIssues.nativeElement.innerHTML =
            "<span class='spotbie-text-gradient spotbie-error'>INVALID USERNAME OR PASSWORD.</span>";
          this.spotbieSignUpIssues.nativeElement.style.display = 'block';
          this.logInForm.get('spotbiePassword').setErrors({required: false});
          this.logInForm.get('spotbieUsername').setErrors({required: false});
          return;
        }
      );
  }

  private loginCallback(loginResponse: any): void {
    if (loginResponse.error === 'popup_closed_by_user') {
      this.loading$.next(false);
      return;
    }

    if (!loginResponse) {
      this.logInForm.setErrors(null);
      this.logInForm.get('spotbieUsername').setErrors({invalidUorP: true});
      this.loading$.next(false);
    }

    const loginStatus = loginResponse.message;

    if (loginStatus === 'success' || loginStatus === 'confirm') {
      Preferences.set({
        key: 'spotbie_userLogin',
        value: loginResponse.user.username,
      });
      Preferences.set({key: 'spotbie_loggedIn', value: '1'});
      Preferences.set({
        key: 'spotbie_rememberMe',
        value: this.userAuthService.userRememberMe,
      });
      Preferences.set({
        key: 'spotbie_userType',
        value: loginResponse.spotbie_user.user_type,
      });
      Preferences.set({
        key: 'spotbiecom_session',
        value: loginResponse.token_info.original.access_token,
      });

      if (this.userAuthService.userRememberMe === '1') {
        this.rememberMeToken = loginResponse.remember_me_token;
        Preferences.set({
          key: 'spotbie_rememberMeToken',
          value: this.rememberMeToken,
        });
      }

      this.loading$.next(false);
      this.router.navigate(['/user-home']);
    } else {
      this.spotbieSignUpIssues.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      if (
        loginStatus === 'invalid_cred' ||
        loginStatus === 'spotbie_account' ||
        loginStatus === 'wrong_account_type'
      ) {
        if (loginStatus === 'invalid_cred') {
          this.spotbieSignUpIssues.nativeElement.innerHTML =
            "<span class='spotbie-text-gradient spotbie-error'>INVALID USERNAME OR PASSWORD.</span>";
          this.spotbieSignUpIssues.nativeElement.style.display = 'block';
        } else if (loginStatus === 'spotbie_account') {
          this.logInForm
            .get('spotbieUsername')
            .setErrors({spotbie_account: true});
        } else if (loginStatus === 'wrong_account_type') {
          this.spotbieSignUpIssues.nativeElement.innerHTML =
            "<span class='spotbie-text-gradient spotbie-error'>LOG-IN WITH THE CLIENT APP.</span>";
          this.logInForm
            .get('spotbieUsername')
            .setErrors({wrong_account_type: true});
        }
      }
    }
    this.loading$.next(false);
  }

  /**
   * Opens the sign up component.
   */
  signUp() {
    this.host.signUpWindow$.next(true);
    this.host.logInWindow$.next(false);
  }

  /**
   * Initiate the user login.
   */
  initLogIn(): void {
    this.loading$.next(true);
    this.submitted$.next(true);
    this.userAuthService.route = this.router.url;

    this.loginUser(this.email, this.password, '1');
  }

  /**
   * Initiate the login form.
   * @private
   */
  private async initLogInForm() {
    const usernameValidators = [Validators.required];
    const passwordValidators = [Validators.required];

    this.logInForm = this.formBuilder.group({
      spotbieUsername: ['', usernameValidators],
      spotbiePassword: ['', passwordValidators],
    });

    this.loading$.next(false);
  }

  /**
   * Log the user in with the stored token.
   */
  async initTokenLogin() {
    const retSavedUsernmae = await Preferences.get({key: 'spotbie_userLogin'});
    const savedUsername = retSavedUsernmae.value;

    // The userPass is set to a random key because the user doesn't need a password to log-in with a token.
    this.loginUser(savedUsername, 'randomkey', '1');
  }

  get email() {
    return this.logInForm.get('spotbieUsername').value;
  }
  get password() {
    return this.logInForm.get('spotbiePassword').value;
  }
  get f() {
    return this.logInForm.controls;
  }

  /**
   * Close this window.
   * It'd be better to navigate between sign-up and log-in using router instead.
   */
  closeWindow() {
    this.host.logInWindow$.next(false);
  }

  /**
   * Navigate to forgot password route.
   */
  openForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  /**
   * subscribe to the loading behavior subject to toggle the loading screen on/off.
   */
  initLoading() {
    this.loading$
      .pipe(filter(loading => loading !== undefined))
      .subscribe(async loading => {
        if (loading) {
          this.loader = await this.loadingCtrl.create({
            message: 'LOADING...',
          });
          this.loader.present();
        } else {
          if (this.loader) {
            this.loader.dismiss();
            this.loader = null;
          }
        }
      });
  }
}
