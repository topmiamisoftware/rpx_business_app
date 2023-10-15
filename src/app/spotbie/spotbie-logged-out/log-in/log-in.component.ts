import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms'
import { UserauthService } from '../../../services/userauth.service'
import { Router } from '@angular/router'
import { MenuLoggedOutComponent } from '../menu-logged-out.component'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { logOutCallback } from 'src/app/helpers/logout-callback'

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['../../menu.component.css', './log-in.component.css'],
})
export class LogInComponent implements OnInit {
  @ViewChild('spotbieSignUpIssues') spotbieSignUpIssues: ElementRef

  faEye = faEye
  faEyeSlash = faEyeSlash
  loading: boolean = false
  bg_color: string
  current_login_photo: string
  current_login_username: string
  logInForm: UntypedFormGroup
  submitted: boolean = false
  helpToggle: boolean = false
  rememberMeState: string = '0'
  rememberMeLight: string = 'red'
  rememberMeTextOff: string = 'Remember Me is set to OFF.'
  rememberMeTextOn: string = 'Remember Me is set to ON.'
  rememberMeToggleStateText: string = this.rememberMeTextOff
  rememberMeToken: string
  forgotPasswordWindow = { open : false }
  passwordShow: boolean = false
  business: boolean = false

  constructor(private host: MenuLoggedOutComponent = null,
              private formBuilder: UntypedFormBuilder,
              private userAuthService: UserauthService,
              private router: Router) { }

  togglePassword(){
    this.passwordShow = !this.passwordShow
  }

  toggleRememberMe(): void{
    if (this.rememberMeState === '0') {
      this.rememberMeState = '1'
      this.rememberMeLight = '#7bb126'
      this.rememberMeToggleStateText = this.rememberMeTextOn
    } else {
      this.rememberMeState = '0'
      this.rememberMeLight = 'red'
      this.rememberMeToggleStateText = this.rememberMeTextOff
    }
  }

  toggleRememberMeHelp(): void{
    this.helpToggle = !this.helpToggle
  }

  loginUser(){
    this.spotbieSignUpIssues.nativeElement.style.display = 'none'

    this.userAuthService.initLogin().subscribe({
      next: (resp) => {
        this.loginCallback(resp)
      },
      error: (e) => {
        this.spotbieSignUpIssues.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        this.spotbieSignUpIssues.nativeElement.innerHTML = `<span class='spotbie-text-gradient spotbie-error'>INVALID USERNAME OR PASSWORD.</span>`
        this.spotbieSignUpIssues.nativeElement.style.display = 'block'
        this.logInForm.get('spotbiePassword').setErrors({ required: false });
        this.logInForm.get('spotbieUsername').setErrors({ required: false });
        this.loading = false
        return
      }
    })
  }

  private loginCallback(loginResponse: any): void{
    if(loginResponse.error === 'popup_closed_by_user'){
      this.loading = false
      return
    }

    if(!loginResponse){

      this.logInForm.setErrors(null)
      this.logInForm.get('spotbieUsername').setErrors({ invalidUorP: true })
      this.loading = false
    }

    const loginStatus = loginResponse.message

    if(loginStatus === 'success' || loginStatus === 'confirm') {
      localStorage.setItem('spotbie_userLogin', loginResponse.user.username)
      localStorage.setItem('spotbie_loggedIn', '1')
      localStorage.setItem('spotbie_rememberMe', this.userAuthService.userRememberMe)
      localStorage.setItem('spotbie_userId', loginResponse.user.id)
      localStorage.setItem('spotbie_userDefaultImage', loginResponse.spotbie_user.default_picture)
      localStorage.setItem('spotbie_userType', loginResponse.spotbie_user.user_type)
      localStorage.setItem('spotbiecom_session', loginResponse.token_info.original.access_token)

      if (this.userAuthService.userRememberMe === '1'){
        this.rememberMeToken = loginResponse.remember_me_token
        localStorage.setItem('spotbie_rememberMeToken', this.rememberMeToken)
      }

      this.router.navigate(['/user-home'])
    } else {
      if (loginStatus === 'invalid_cred' ||
          loginStatus === 'spotbie_google_account' ||
          loginStatus === 'spotbie_fb_account' ||
          loginStatus === 'spotbie_account' ||
          loginStatus === 'wrong_account_type'
      ) {
        if (loginStatus === 'invalid_cred') {
          this.spotbieSignUpIssues.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'})
          this.spotbieSignUpIssues.nativeElement.innerHTML = `<span class='spotbie-text-gradient spotbie-error'>INVALID USERNAME OR PASSWORD.</span>`
          this.spotbieSignUpIssues.nativeElement.style.display = 'block'
        } else if (loginStatus === 'spotbie_google_account') {
          this.logInForm.get('spotbieUsername').setErrors({spotbie_google_account: true})
        } else if (loginStatus === 'spotbie_account') {
          this.logInForm.get('spotbieUsername').setErrors({spotbie_account: true})
        } else if(loginStatus === 'wrong_account_type') {
          this.logInForm.get('spotbieUsername').setErrors({wrong_account_type: true})
        }
        logOutCallback({success: true}, false)
      }
    }
    this.loading = false
  }

  initLogIn(): void{
    this.loading = true
    this.submitted = true

    this.userAuthService.userLogin = this.email
    this.userAuthService.userPassword = this.password
    this.userAuthService.userRememberMe = this.rememberMeState
    this.userAuthService.route = this.router.url

    this.loginUser()
  }

  private initLogInForm(): void{
    const usernameValidators = [Validators.required]
    const passwordValidators = [Validators.required]

    if (localStorage.getItem('spotbie_rememberMe') === '1') this.toggleRememberMe()

    this.logInForm = this.formBuilder.group({
      spotbieUsername: ['', usernameValidators],
      spotbiePassword: ['', passwordValidators]
    })

    if (this.current_login_username !== '')
      this.logInForm.get('spotbieUsername').setValue(this.current_login_username)

    this.loading = false
  }

  initTokenLogin(): void {
    const savedRememberMeToken = localStorage.getItem('spotbie_rememberMeToken')
    const savedUsername = localStorage.getItem('spotbie_userLogin')

    this.userAuthService.userLogin = savedUsername
    this.userAuthService.userPassword = ''
    this.userAuthService.userRememberMe = '1'
    this.userAuthService.userRememberMeToken = savedRememberMeToken

    this.loginUser()
  }

  get email() { return this.logInForm.get('spotbieUsername').value }
  get password() { return this.logInForm.get('spotbiePassword').value }
  get f() { return this.logInForm.controls }

  closeWindow(){
    this.host.closeWindow(this.host.logInWindow)
  }

  openWindow(window: any): void{
    window.open = true
  }

  signUp(){
    this.host.openWindow(this.host.signUpWindow)
    this.host.closeWindow(this.host.logInWindow)
  }

  usersHome(){
    this.router.navigate(['/home'])
  }

  businessHome(){
    this.router.navigate(['/business'])
  }

  getCurrentWindowBg(){
    if(this.business){
      return 'sb-businessBg'
    } else {
      return 'sb-regularBg'
    }
  }

  openIg(){
    if(this.business){
      window.open('https://www.instagram.com/spotbie.business/','_blank')
    } else {
      window.open('https://www.instagram.com/spotbie.loyalty.points/','_blank')
    }
  }

  openYoutube(){
    window.open('https://www.youtube.com/channel/UCtxkgw0SYiihwR7O8f-xIYA','_blank')
  }

  openTwitter(){
      window.open('https://twitter.com/SpotBie','_blank')
  }

  openBlog(){
    window.open('https://blog.spotbie.com/','_blank')
  }

  ngOnInit() {
    this.loading = true
    this.current_login_username = localStorage.getItem('spotbie_lastLoggedUserName')
    this.bg_color = '#181818'
    this.current_login_photo = 'assets/images/user.png'
    this.router.url === '/business' ? this.business = true : this.business = false

    this.initLogInForm()

    if (localStorage.getItem('spotbie_rememberMe') === '1' &&
        localStorage.getItem('spotbie_loggedIn') !== '1') {
      this.initTokenLogin()
    }
  }
}
