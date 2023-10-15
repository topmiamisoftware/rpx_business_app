import { environment } from "src/environments/environment"

export const logOutCallback = function(resp: any, locationReload: boolean = true): void{

    console.log('LOG OUT CALLBACK');

    if(resp.success){

        let loggedOutFavorites = localStorage.getItem('spotbie_currentFavorites')

        localStorage.clear()
        
        localStorage.setItem('spotbie_currentFavorites', loggedOutFavorites)

        localStorage.setItem('spotbie_locationPrompted', '1')
        localStorage.setItem('spotbie_userId', '0')
        localStorage.setItem('spotbie_loggedIn', '0')
        localStorage.setItem('spotbie_userApiKey', null)
        localStorage.setItem('spotbie_rememberMe', '0')
        localStorage.setItem('spotbie_rememberMeToken', null)
        localStorage.setItem('spotbie_userType', null)

        if(locationReload) 
            window.open(environment.baseUrl + 'home', '_self')

    }

}
