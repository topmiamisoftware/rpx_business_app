import {Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {UserauthService} from '../../../services/userauth.service';
import {BehaviorSubject} from 'rxjs';

const DEF_INC_PASS_OR_EM_MSG = 'Enter your e-mail address.';
const DEF_PIN_PASS_OR_EM_MSG = 'Check your e-mail for a reset link.';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('getLinkMessage') getLinkMessage;

  passwordResetForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  passResetSubmitted$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(false);

  stepOne$ = new BehaviorSubject<boolean>(false);
  stepTwo$ = new BehaviorSubject<boolean>(false);

  pinReadyMsg$ = new BehaviorSubject<string>(DEF_PIN_PASS_OR_EM_MSG);
  emailOrPhError$ = new BehaviorSubject<string>(DEF_INC_PASS_OR_EM_MSG);

  constructor(
    private formBuilder: UntypedFormBuilder,
    private userAuthService: UserauthService
  ) {}

  get spotbieEmailOrPh() {
    return this.passwordResetForm.get('spotbieEmailOrPh').value;
  }

  get g() {
    return this.passwordResetForm.controls;
  }

  get h() {
    return this.passwordForm.controls;
  }

  ngOnInit() {
    this.initForgotPassForm();
    this.stepOne$.next(true);
  }

  setPassResetPin(): void {
    this.loading$.next(true);
    this.passResetSubmitted$.next(true);

    if (this.passwordResetForm.invalid) {
      this.loading$.next(false);
      return;
    }

    this.userAuthService
      .setPassResetPin(this.spotbieEmailOrPh)
      .subscribe(resp => {
        this.startPassResetCb(resp);
      });
  }

  private initForgotPassForm(): void {
    const spotbieEmailOrPhValidators = [
      Validators.required,
      Validators.maxLength(130),
    ];

    this.passwordResetForm = this.formBuilder.group({
      spotbieEmailOrPh: ['', spotbieEmailOrPhValidators],
    });
  }

  private startPassResetCb(httpResponse: any): void {
    if (httpResponse && httpResponse.success) {
      if (httpResponse.status === 'passwords.sent') {
        this.stepOne$.next(false);
        this.showSuccess();
      } else if (httpResponse.status === 'passwords.throttled') {
        this.emailOrPhError$.next(
          'You have sent too many password reset requests, please try again later.'
        );
      } else if (httpResponse.status === 'social_account') {
        this.emailOrPhError$.next('You signed up with social media.');
      } else {
        this.emailOrPhError$.next('E-mail address not found.');
      }
    } else {
      this.emailOrPhError$.next('I e-mail address.');
    }

    this.getLinkMessage.nativeElement.style.display = 'none';
    this.getLinkMessage.nativeElement.className =
      'spotbie-text-gradient spotbie-error spotbie-contact-me-info';
    this.getLinkMessage.nativeElement.style.display = 'block';

    this.loading$.next(false);
  }

  private showSuccess(): void {
    this.stepTwo$.next(true);
  }
}
