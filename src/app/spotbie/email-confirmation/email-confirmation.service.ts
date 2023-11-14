import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'
import { retryWithBackOff } from '../../helpers/retry.operators'

const EMAIL_API = `${environment.apiEndpoint}user/unique-email`
const SEND_EMAIL_CODE_API = `${environment.apiEndpoint}user/send-code`
const EMAIL_CONFIRM_PIN_API = `${environment.apiEndpoint}user/check-confirm`

@Injectable({
  providedIn: 'root'
})
export class EmailConfirmationService {

  constructor(private httpClient: HttpClient) {}

  public sendCode(firstName:string, email: string): Observable<any>{

    const sendCodeApi = `${SEND_EMAIL_CODE_API}`

    const sendCodeObj = {
      first_name: firstName,
      email: email
    }

    return this.httpClient.post<any>(sendCodeApi, sendCodeObj).pipe(
      retryWithBackOff(1000)
    )

  }

  public checkCode(code: string, email: string): Observable<any>{

    const sendCodeApi = `${EMAIL_CONFIRM_PIN_API}`

    const sendCodeObj = {
      confirm_code: code,
      email: email      
    }
    
    return this.httpClient.post<any>(sendCodeApi, sendCodeObj).pipe(
      retryWithBackOff(1000)
    )

  }

  public checkIfEmailUnique(email: string): Observable<any>{
        
    const testEmailApi = EMAIL_API
    const emailObj = {
        email: email,
    }

    return this.httpClient.post<any>(testEmailApi, emailObj).pipe(
        retryWithBackOff(1000)
    )
    
  }

}
