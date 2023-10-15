export const isCordova = function (){
    
    let isCordova = localStorage.getItem('isCordova')

    if(isCordova === '1') return true; else return false;

}

/*Uncomment this in android
if(cordova != undefined){
    var permissions = cordova.plugins.permissions
} else {
    var permissions = null
}

export const getGeolocation = function(callback, error) {
        
    const hasPermission = permissions.hasPermission(permissions.ACCESS_FINE_LOCATION)

    if(hasPermission){
        window.navigator.geolocation.getCurrentPosition(callback) 
    } else {
        permissions.requestPermission(
            permissions.ACCESS_FINE_LOCATION, 
            function(){
                window.navigator.geolocation.getCurrentPosition(callback) 
            }, 
            error
        )
    }

}*/