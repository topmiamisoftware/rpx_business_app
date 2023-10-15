var onSuccess = function(result) {
    console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
    console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
};

var onError = function(msg) {
    console.log("Sharing failed with message: " + msg);
};

export const shareNative = function (message, subject, url, chooserTitle){

    var options = {
        message: message, // not supported on some apps (Facebook, Instagram)
        subject: subject, // fi. for email
        url:  url,
        chooserTitle: chooserTitle, // Android only, you can override the default share sheet title
    };

    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

}