var rootURL = "";
var root = this; // used by pdfbrowser and childbrowser
var deviceSDID;
var cordovaIsLoaded = false;
var deviceSDID = "???";
var SDID_DOMAIN = 'com.phonegap.securedeviceidentifier';  
var SDID_KEY = '1234567890';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        postDeviceReadyActions();        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function catchError(f,e){
    report('ERROR','ERROR in (' + f + ')[Error Message: ' + e.message + ']');
}


isMobile  = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};


/* ----------------------------------------------------------- /
    postDeviceReadyActions
/ ----------------------------------------------------------- */
function postDeviceReadyActions(){
    //report('TEST','--> postDeviceReadyActions()..');  
    try{
        window.console.log('Device Ready!');
        cordovaIsLoaded = true;        
        initApp();                                        
    }catch(e){ catchError('postDeviceReadyActions()',e); }            
}


/* ----------------------------------------------------------- /
    initApp
/ ----------------------------------------------------------- */
function initApp(){
    report('TEST','--> initApp()..');  
    try{
        $(document).ready(function(){
            populateDeviceInfo();
        });
                                     
    }catch(e){ catchError('initApp()',e); }            
}


if(isMobile.any()){ 
    document.write("<script type='text/javascript' src='" + rootURL + "cordova.js'></script>"); 
}else{
    window.console.log('NOT-DEVICE-MODE: Skipping loading of [cordova.js] and plugins...');    
    initApp();
}
    

function debugModeEnabled(){
    return true; //false;
}

/* ----------------------------------------------------------- /
    report
/ ----------------------------------------------------------- */
function report(logtype,msg){
    try{
        window.console.log(logtype + ': ' + msg);                                                
    }catch(e){ 
        // give up
    }            
}

window.onerror = function(message, url, linenumber) { report("ERROR","JavaScript error: " + message + " on line " + linenumber + " for " + url); }
function preventBehavior(e) {     e.preventDefault();  };


/* DEBUG */ window.console.log('js/index.js loaded...');