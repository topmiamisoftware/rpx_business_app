import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms'
import { ValidatePassword } from '../../../helpers/password.validator'
import { MustMatch } from '../../../helpers/must-match.validator'
import { UserauthService } from 'src/app/services/userauth.service'
import { ActivatedRoute, Router } from '@angular/router'

const DEF_INC_PASS_OR_EM_MSG = "Please enter your e-mail address."

const DEF_PIN_PASS_OR_EM_MSG = "Check your e-mail for a reset link."

const NEW_PASS_MSG =  "Enter Your New Password."

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  @Output() closeWindow = new EventEmitter()

  @ViewChild('getLinkMessage') getLinkMessage

  public passwordResetForm: UntypedFormGroup
  public passwordResetForm_2: UntypedFormGroup
  public passwordForm: UntypedFormGroup

  public passResetSubmitted: boolean = false

  public loading: boolean = false

  public password_submitted: boolean = false

  public save_password: boolean = false

  public step_one: boolean = false
  public step_two: boolean = false
  public step_three: boolean = false
  public step_four: boolean = false

  public pin_reset_submitted: boolean = false

  public attempts_remaining: number = 3

  public reset_pin: string 

  public pin_ready_msg: string = DEF_PIN_PASS_OR_EM_MSG

  public email_or_ph_error: string = DEF_INC_PASS_OR_EM_MSG
  
  public new_password_msg: string = NEW_PASS_MSG

  public token: string

  public userEmail: string

  constructor(private activatedRoute: ActivatedRoute,
              private formBuilder: UntypedFormBuilder,
              private userAuthService: UserauthService,
              private router: Router) { }

  public closeWindowX(): void{
      this.closeWindow.emit(null)
  }

  private initForgotPassForm(): void{

    const spotbie_email_or_ph_validators = [Validators.required, Validators.maxLength(130)]

    this.passwordResetForm = this.formBuilder.group({
      spotbie_email_or_ph: ['', spotbie_email_or_ph_validators]
    })

  }
  
  get spotbie_email_or_ph() { return this.passwordResetForm.get('spotbie_email_or_ph').value }
  get g() { return this.passwordResetForm.controls }

  get spotbieResetPassword() { return this.passwordForm.get('spotbieResetPassword').value }
  get spotbieResetPasswordC() { return this.passwordForm.get('spotbieResetPasswordC').value }

  get h() { return this.passwordForm.controls }

  private showSuccess(): void{

    this.step_two = true

  }

  public setPassResetPin(): void{

    this.loading = true
    this.passResetSubmitted = true

    if(this.passwordResetForm.invalid){
      this.loading = false
      return
    }  
    
    let emailOrPhone = this.spotbie_email_or_ph

    this.userAuthService.setPassResetPin(emailOrPhone).subscribe(
      resp => {
        this.startPassResetCb(resp)
      }
    )

  }

  private startPassResetCb(httpResponse: any): void{

    console.log("startPassResetCb", httpResponse)

    if(httpResponse && httpResponse.success){

      if(httpResponse.status == 'passwords.sent'){
        this.step_one = false        
        this.showSuccess()
      } else if(httpResponse.status == 'passwords.throttled'){
        this.email_or_ph_error = "You have sent too many password reset requests, please try again later."
      } else if(httpResponse.status == 'social_account'){
        this.email_or_ph_error = "You signed up with social media."
      } else {
        this.email_or_ph_error = "E-mail address not found."
      }

    } else {

      console.log('Pass Reset Error: ', httpResponse)
      this.email_or_ph_error = "I e-mail address."

    }
      
    this.getLinkMessage.nativeElement.style.display = 'none'
    this.getLinkMessage.nativeElement.className = 'spotbie-text-gradient spotbie-error spotbie-contact-me-info'
    this.getLinkMessage.nativeElement.style.display = 'block'

    this.loading = false

  }

  private initPasswordForm(): void{

    this.step_three = true

    const password_validators = [Validators.required]
    const password_confirm_validators = [Validators.required]

    this.passwordForm = this.formBuilder.group({
      spotbieResetPassword: ['', password_validators],
      spotbieResetPasswordC: ['', password_confirm_validators]
    },{
      validators: [ValidatePassword('spotbieResetPassword'),
                MustMatch('spotbieResetPassword', 'spotbieResetPasswordC')]
    }) 
    
  }

  public completeSavePassword(): void {
    
    this.password_submitted = true
    
    if(this.passwordForm.invalid){
      this.save_password = false
      return
    } 

    if(this.save_password) return

    this.loading = true
    
    this.userAuthService.completeReset(this.spotbieResetPassword,  this.spotbieResetPasswordC, this.userEmail, this.token).subscribe( 
      resp => {
        this.completeSavePasswordCb(resp)
      }
    )

  }

  private completeSavePasswordCb(settingsResponse: any): void {

    if (settingsResponse.success) {
      
      switch (settingsResponse.status) {

        case 'passwords.reset':

          this.new_password_msg = 'Your password was updated. You can now log-in.'
          
          this.step_three = false
          this.step_four = true
          
          setTimeout(function(){
            this.closeWindowX()
          }.bind(this), 3000)
          
          break

        case 'passwords.token':
          //Expired Token
          this.new_password_msg = 'The password reset link has expired, please try to reset your password again.'
          break
        
        default:
          this.closeWindowX()
      }
      
    } else
      console.log(settingsResponse)

    this.save_password = false
    this.loading = false

  }

  public goHome(){
    this.router.navigate(['/home'])
  }

  ngOnInit() {

    this.token = this.activatedRoute.snapshot.paramMap.get('token')

    if(this.token !== null){

      const urlParams = new URLSearchParams(window.location.search)

      this.userEmail = urlParams.get('email')
      this.initPasswordForm()

      this.step_three = true

    } else {      

      this.initForgotPassForm()
      this.step_one = true
      
    }
  
  }

}
