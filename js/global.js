/* --------------------------------------- */
function doAlert(message, title){

	try{
		var alertText = message;
		var alertTitle = title;
		if(usingMobileDevice() && isNativeAppMode()){
			navigator.notification.alert(
			alertText,  // message
			alertDismissed,         // callback
			alertTitle,            // title
			'OK'                  // buttonName
			);		
		}else{
			alert(alertTitle + "\n\n" + alertText);
		}	
		report('VERBOSE','doAlert() --> [' + alertTitle + ' | ' + alertText);
		return false;		
	}catch(ex){
		catchError('doAlert()',ex);
	}	
	
}

/* ---------------------------------------- */
function alertDismissed(e){
    // nothing - just stub function
    return false;
}



/* --------------------------------------- */
// NOTE: callback button index must be 1 (the first one)
function doConfirm(confirmText, confirmTitle, confirmCallback, confirmButtonLabels){

	try{
				
		if(typeof(confirmButtonLabels) == 'undefined') confirmButtonLabels = ('Yes,No').split(",");
		report('doConfirm() [confirmText:' + confirmText + ', confirmCallback:' + confirmCallback + ']');
	        
		if(usingMobileDevice() && isNativeAppMode()){
			
		  //fadePageContentOutBeforePopup();
			
		   navigator.notification.confirm(
				confirmText,
				confirmCallback,
				confirmTitle,
				confirmButtonLabels          
			);	
			
			//fadePageContentInAfterPopup();
				
		}else{
			var confirmDecisionIndex = 2; // represents "false"
			if(confirm(confirmText)) confirmDecisionIndex = 1;
			confirmCallback(confirmDecisionIndex);
		}		
	}catch(ex){
		catchError('doConfirm()',ex);
	}	

}

/* --------------------------------------- */	
function isValidString(str){
	if(
		(typeof(str) != 'undefined') &&
		(str != '') &&
		(str != undefined) &&
		(str != null) &&
		(str != 'undefined')
	){
		return true;
	}else{
		return false;
	}
}

/* --------------------------------------- */
function isIOSSimulatorMode(){

	var _isIOSSimulatorMode = false;; 
	try{
		if(!usingMobileDevice()) return false;
		var _platform = getDeviceType().toUpperCase();// device.name
		_isIOSSimulatorMode =(_platform.indexOf('SIMULATOR',0) > -1);		
	}catch(ex){
		catchError('isIOSSimulatorMode()',ex);
	}

	//window.console.log('isIOSSimulatorMode(' + _isIOSSimulatorMode + ') platform:' +  device.name);
	return _isIOSSimulatorMode;	
}


/* --------------------------------------- */
function isNativeAppMode(){
	// re-test if/when using non-Apple devices
		 
	var isNative;
	var isSafari = navigator.userAgent.match(/Safari/i) != null;
	
	if((document.location.href.toUpperCase().indexOf('FILE://',0) > -1) && (usingMobileDevice())){
		isNative = true;
	}else{
		isNative = false;
	}
	
	// report('\t\t isNativeAppMode() isSafari [' + isSafari + '] [isNative "FILE:" link?:' + isNative + ']');
	//*DEBUG */ report('--> isNativeAppMode(' + isNative + ')');
	return isNative;
}

function usingMobileDevice(){
	var _isMobile = isMobile.any(); // globals.js
	// var userAgent = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
	return _isMobile;
}

// DEVICE DETECTION: Device API mode
function isiPhone(){
    return (
        //Detect iPhone
        (navigator.platform.indexOf("iPhone") != -1) ||
        //Detect iPod
        (navigator.platform.indexOf("iPod") != -1)
    );
}

function nullClickEvent(e){ 	e.stopPropagation(); }


function getRandomID(){
	var dateNow = new Date();
	return String(Number(dateNow.getMilliseconds() * dateNow.getSeconds()));
}



function getDeviceID(){

	try{
		if(cordovaIsLoaded){			
			// _id = device.uuid; uuid deprecated...
            
            // this only works if SecureDeviceIdentifier plugin is loaded into xcode/app
            var secureDeviceIdentifier = window.plugins.secureDeviceIdentifier;            
            /* DEBUG */ // doAlert('getDeviceID() [secureDeviceIdentifier:' + secureDeviceIdentifier + ']');
            
            secureDeviceIdentifier.get({
                domain: SDID_DOMAIN,
                key: SDID_KEY
            }, function(udid) {                
                /* DEBUG */ //   navigator.notification.alert("SecureUDID=" + udid);
                deviceSDID = udid;
                // navigator.notification.alert("SecureUDID=" + udid);
                // report('TEST','CORDOVA: DEVICE ID:' + deviceSDID);
                /* DEBUG */ //  alert(deviceSDID);
                return deviceSDID;
            })                        
            // report('TEST',"*** plugins.uniqueDeviceId.secureDeviceIdentifier() ID?:" + _id + "***");            	
            // report('TEST','WEB: DEVICE ID:' + deviceSDID);
        }else{
        	deviceSDID = "UNKNOWN (" + getDeviceType() + ")";
        }
	}
	catch(e){
		report('ERROR','ERROR with getDeviceID() [' + e.message + ']');
	}

		
}

function getDeviceType(){
	var type;
	
	try{
		if(cordovaIsLoaded){
            type = device.model; // "name" deprecated after CDV 2.3 name;  // iPhone, iPad, iPod Touch
		}else{
			 type = "WebBrowser";
		}
	}
	catch(e){
		report('VERBOSE','ERROR','ERROR with getDeviceType() [' + e.message + ']');
	}
			
	return type;
}


/* ----------------------------------------------------------- /
	getOSVersionFromUserAgent
/ ----------------------------------------------------------- */
function getOSVersionFromUserAgent(){
	report('TEST','--> getOSVersionFromUserAgent()..');	
	try{
		var _parts1 = navigator.userAgent.split("(");
		var _parts2 = _parts1[1].split(";");

		return _parts2[0];												
	}catch(e){ catchError('getOSVersionFromUserAgent()',e); }			
}


function getDeviceVersion(){
	var version;
	
	try{
		if(cordovaIsLoaded){
            version = getOS() + ' ' + device.version; // "name" deprecated after CDV 2.3 name;  // iPhone, iPad, iPod Touch
		}else{
		 	 version = getOSVersionFromUserAgent();		 	 
		}
	}
	catch(e){
		report('VERBOSE','ERROR','ERROR with getDeviceVersion() [' + e.message + ']');
	}
			
	return version;
}

function getDeviceModel(){
	var model;
	
	try{
		if(cordovaIsLoaded){
			model = device.model; // iPad 2,5			
		}else{
			model = getOS();
		}
	}
	catch(e){
		report('VERBOSE','ERROR','ERROR with getDeviceModel() [' + e.message + ']');
	}
	
	report('VERBOSE','DEVICE NAME:' + model);	
		
	return model; 
}

function getDevicePlatform(){
	var platform;
	
	try{
		if(cordovaIsLoaded){
			if(isIOSSimulatorMode()){
				platform = "iOS Simulator";
			}else{
				platform = device.platform; // iPad, iPhone	
			}
			
		}else{
			platform = getDeviceType(); // WebBrowser likely
		}
	}
	catch(e){
		report('VERBOSE','ERROR','ERROR with getDevicePlatform() [' + e.message + ']');
	}
	
	report('VERBOSE','DEVICE NAME:' + platform);	
		
	return platform; 
}

function removeNonAlphaNumericChars(str){	
	str = str.replace(/[ ]+/g,'_');
	str = str.replace(/[^a-zA-Z0-9_-]+/g,'');
	return str;	
}


function removeProtectedDelimeters(str){		
	str = str.replace(/[,;|]+/g,'');
	return str;	
}


function getOS(){
	var OSName="Unknown OS";
	if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
	if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";	
	if((navigator.appVersion.indexOf("Mobile")!=-1)) OSName += " Mobile";

	if(cordovaIsLoaded){
		OSName = device.platform;
	}
	
	return OSName;	
}

function openExternalURL(strURL){	
    
    // https://itunes.apple.com/us/app/isitlead/id637464156?ls=1&mt=8

    try{

		if(!isConnectedToInternet()){
			doGenericConnectionAlert();
			return false;
		}

        // doAlert('openExternalURL(' + strURL + ')... MODE (TBD)...');
                
		// window.open(strURL, '_system'); //, 'location=yes');	
		if(
			((isIOSSimulatorMode()) || (!isMobile.any())) &&
			(strURL.toUpperCase().indexOf('ITUNES.APPLE.COM',0)>-1)
			){
			alert('App Store links do not work in web browsers or device simulators. Please try this feature on a mobile device to confirm it is working properly.','App Store Link');
			return false;
		}

		// inAppBrowser method --> window.open(strURL, '_system'); //, 'location=yes');
		
	     // ChildBrowser Method // /*cb = child browser cordova plugin*/
	     if(cb != null)
	     {
	     	window.console.log('openExternalURL(' + strURL + ') [CORDOVA mode]..');
	         cb.onLocationChange = function(loc){ root.locChanged(loc); };
	         cb.onClose = function(){root.onCloseBrowser()};
	         cb.onOpenExternal = function(){root.onOpenExternal();};		
	         //window.console.log(strURL);
	         // cb.showWebPage(strURL);
	         // window.plugins.childBrowser.showWebPage(strURL);
	         window.open(strURL,'_blank','location=no'); 
	     }else{
	    	
	         // if(            	
	         // 	(!isNativeAppMode()) && 
	         // 	(usingMobileDevice())
	         // 	){
			window.console.log('openExternalURL(' + strURL + ') [TEST/BROWSER mode].. {isNativeAppMode:' + isNativeAppMode() + '| usingMobileDevice:' + usingMobileDevice() + '}');
	         if(confirm('HTML5 External URLs are not fully functional when viewing on the iOS Simulator - do you want to view the URL anyway?')){
	             document.location.href = strURL;
	             /* 20130716: window.open not working in CHrome??? */ // window.open(strURL,'_blank'); 

	         }else{
	         	return false;			
	         }		
	         //}                                   
	     }
    }catch(e){
        catchError('openExternalURL()...',e);
    }	
} 


/* ------------------------------------ */
function onCloseBrowser()
{    
    window.console.log('onCloseBrowser()...');
    if(iTunesUpdateURLLoaded) iTunesUpdateURLLoaded = false;
}

/* ------------------------------------ */
function locChanged(loc) { window.console.log('locChanged()...');   }
function onOpenExternal(){ window.console.log('onOpenExternal()...'); }    

function isiPhone(){
    return (
        //Detect iPhone
        (navigator.platform.indexOf("iPhone") != -1) ||
        //Detect iPod
        (navigator.platform.indexOf("iPod") != -1)
    );
}


function scrollToTop(){
	$(window).scrollTop(0); //window.scrollTo(0,0);
}


function getURLParameter(name) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}


function getUniqueIDString(){
	var time = new Date();
	return String(time.getMilliseconds() + time.getSeconds() + time.getDate());
}


function clearTimeoutVar(tVar){
	
	try{
		if(typeof(tVar) != 'undefined'){
			window.clearTimeout(tVar);
		}											
	}catch(e){ catchError('clearTimeoutVar()',e); }					
	

}

function clearIntervalVar(iVar){
	
	try{
		if(typeof(iVar) != 'undefined'){
			window.clearInterval(iVar);
		}											
	}catch(e){ catchError('clearIntervalVar()',e); }					
	

}




function isConnectedToInternet(){
	var connectionType = getConnectionType();
	return (
			(connectionType.toUpperCase().indexOf("NO NETWORK",0) == -1) &&
			(connectionType.toUpperCase().indexOf("UNKNOWN",0) == -1)
			);
}


function getConnectionType() {
	
	if(cordovaIsLoaded != true){
		// simulate offline with querystring ?OFFLINE=1
		if(getURLParameter("OFFLINE") != ""){
			return "No network connection";	
		}else{
			return "wifi";	
		}		
	} 
	
    var networkState = navigator.connection.type;//navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';
	
    // alert('Connection type: ' + states[networkState]);
	return states[networkState];
}


// onSuccess Callback
//
function cordovaOnSuccess() {
	console.log("playAudio():Audio Success");
}

// onError Callback 
//
function cordovaOnError(error) {
	alert('code: '    + error.code    + '\n' + 
		  'message: ' + error.message + '\n');
}


/* ----------------------------------------------------------- /
	isDisabled(element)	
/ ----------------------------------------------------------- */
function isDisabled(element){
	report('VERBOSE','--> isDisabled()..');	
	try{
		return ($(element).hasClass('disabled'));
												
	}catch(e){ catchError('isDisabled()',e); }			
}



function hideKeyboard(){
	document.activeElement.blur();
	$("input").blur();
	$("body").focus();
};

function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function doGenericConnectionAlert(){
	doAlert('This feature requires an internet connection. Please connect this device to a WiFi or a 3G/4G network and try again.','Internet Connection Required');
}	

function secondsBetweenTwoDates(date1, date2){	
	var difference = (date2 - date1) / 1000;
	return difference;
}


/* ----------------------------------------------------------- /
	getBasicTimeString
	example: 5:23 PM
/ ----------------------------------------------------------- */
function getBasicTimeString(h,m,excludeSuffix){
	
	try{

		var _hour = h;
		var _min = m;
		var _ampm = "AM";

        if(_hour > 11){ _ampm = "PM";}		
		if(_hour > 12){ _hour -= 12;}		
		
		// integrate [excludeSuffix] later
		if(_min < 10) _min = "0" + m.toString();
		_timeString = _hour + ":" + _min + " " + _ampm;		

		
		report('TEST','--> getBasicTimeString(h:' + h + ',m:' + m + ',excludeSuffix:' + excludeSuffix + ').. [' + _timeString + ']');	

		return _timeString;
												
	}catch(e){ catchError('getBasicTimeString()',e); }			
}		

function isEmpty(value){
  return (value == null || value.length === 0);
}

String.prototype.replaceAll = function(str1, str2, ignore) 
{
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}


function sendEmail(strTo,strSubject,strBody){
	
	if(isEmpty(strTo)) return;
	if(isEmpty(strSubject)) strSubject = '';
	if(isEmpty(strBody)) strBody = '';

	//strBody += '------------------------' + getEncodedLineBreakChar(); // + '---- contacts ----' + getEncodedLineBreakChar() + emailContactsList;	

	if(emailComposerConfiguredInApp && cordovaIsLoaded){
		var emailArgs = {
			toRecipients:strTo,
			subject:strSubject,
			body:strBody,
			isHTML:false
		};
		cordova.exec(null, null, "EmailComposer", "showEmailComposer", [emailArgs]);
	}else{
		document.location = "mailto:" + strTo + "?Subject=" + strSubject + "&Body=" + strBody;
	}
	           
}

function isLocalHost(){ return (document.location.href.indexOf('localhost',0) > -1); }


/* ----------------------------------------------------------- /
    PWpreventAutoLock
/ ----------------------------------------------------------- */
function PWpreventAutoLock(){
    if(cordovaIsLoaded) report('TEST','--> PWpreventAutoLock()..'); 
    try{
        if(cordovaIsLoaded && isMobile.any()) cordova.require('cordova/plugin/powermanagement').acquire( powerMgmtSuccess, powerMgmtError );                                                
    }catch(e){ catchError('PWpreventAutoLock()',e); }           
}       

/* ----------------------------------------------------------- /
    PWpreventAutoLockButAllowDim
/ ----------------------------------------------------------- */
function PWpreventAutoLockButAllowDim(){
    if(cordovaIsLoaded) report('TEST','--> PWpreventAutoLockButAllowDim()..');  
    try{
        if(cordovaIsLoaded && isMobile.any()) cordova.require('cordova/plugin/powermanagement').dim( powerMgmtSuccess, powerMgmtError ); 
    }catch(e){ catchError('PWpreventAutoLockButAllowDim()',e); }            
}       

/* ----------------------------------------------------------- /
    PWreenableAutoLock
/ ----------------------------------------------------------- */
function PWreenableAutoLock(){
    if(cordovaIsLoaded) report('TEST','--> PWreenableAutoLock()..');    
    try{
        if(cordovaIsLoaded && isMobile.any()) cordova.require('cordova/plugin/powermanagement').release( powerMgmtSuccess, powerMgmtError ); 
    }catch(e){ catchError('PWreenableAutoLock()',e); }          
}      

function powerMgmtError(error){ report('ERROR','powerMgmtError() [error(' + error + ')]'); }
function powerMgmtSuccess(success){ report('TEST','powerMgmtSuccess() success: ' + powerMgmtSuccess + '...');}


//* DEBUG */ window.console.log('js/global.js loaded...');