var rootURL = "";
var root = this; // used by pdfbrowser and childbrowser
var deviceSDID;
var cordovaIsLoaded = false;
var deviceSDID = "???";
var SDID_DOMAIN = 'com.phonegap.securedeviceidentifier';
var SDID_KEY = '1234567890';

/* ----------------------------------------------------------- /
    initApp
/ ----------------------------------------------------------- */
function initApp(){
    report('TEST','--> initApp()..');
    try{
        $(document).ready(function(){

            initTests();
        });

    }catch(e){ catchError('initApp()',e); }
}


if(isMobile.any()){
    document.write("<script type='text/javascript' src='" + rootURL + "cordova.js'></script>");
}else{
    window.console.log('NOT-DEVICE-MODE: Skipping loading of [cordova.js] and plugins...');
    initApp();
}



/* DEBUG */ window.console.log('js/index.js loaded...');
