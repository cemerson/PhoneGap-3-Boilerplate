/* ----------------------------------------------------------- /
	utils.js

	Currently badly organized collection of various utility 
	methods for string retrieval, manipulation and other stuff
/ ----------------------------------------------------------- */

function disableClickAndTouchEvents(e){ 	e.stopPropagation();}

/* --------------------------------------- */
function getCurrentPageName(upperCase){
	
	var sPath = window.location.pathname;
	var sPage;
	if(sPath.indexOf("\\",0) > -1){
		// use back slash
		sPage = sPath.substring(sPath.lastIndexOf('\\') + 1);
	}else{
		// use forward slash
		sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
	}	
	if(upperCase == true){
		return sPage.toUpperCase();	
	}else{
		return sPage;	
	}
}
	
/* --------------------------------------- */	
function getURLRoot(){
	var appURL = document.location.href;
	var appURLString = appURL.split("/");
	var appRoot = "/" + appURLString[appURLString.length-2];	

	var appPath = "";
	for(var p=0;p<appURLString.length-1;p++){
		appPath += appURLString[p] + '/';
	}

	// alert('\n\t- [url:' + appURLString + '] \n\t- [root:' + appRoot + ']');
	return appPath; //appRoot;
}
	

/* --------------------------------------- */	
function initCap(str) { 
if(!str) return false;
 var str = str.substring(0,1).toUpperCase() + str.substring(1,str.length).toLowerCase(); 
 return str; 
}


if (!String.prototype.contains) {
    String.prototype.contains = function (arg) {
        return !!~this.indexOf(arg);
    };
}

String.prototype.removeLeadingOrTrailingCommasOrSemicolons = function(){
	var arg = this;
	var oldarg = arg;
	if((arg.substring(0,1) == ',') || (arg.substring(0,1) == ';')) arg = arg.substring(1,arg.length);
	if((arg.substring(arg.length-1,arg.length) == ',') || (arg.substring(arg.length-1,arg.length) == ';')) arg = arg.substring(0,arg.length-1);
	// report('VERBOSE',' removeLeadingOrTrailingCommasOrSemicolons() OLD:(' + oldarg + ') | NEW:(' + arg + ')');	
	return arg;
};

String.prototype.stringContains = function(it) { return this.indexOf(it) != -1; };

if (typeof String.prototype.trim != 'function') { // detect native implementation
  String.prototype.trim = function () {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  };
}



/* ---------------------------------------- */
function addPaddedZero(num){
	if(num < 10) return String('0' + String(num));
	return String(num);
}

/*
 * Title Caps 
 * 
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */
/* ---------------------------------------- */
(function(){
	var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
	var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
  
	this.titleCaps = function(title){
		var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;
		
		while (true) {
			var m = split.exec(title);

			parts.push( title.substring(index, m ? m.index : title.length)
				.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
					return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
				})
				.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
				.replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
					return punct + upper(word);
				})
				.replace(RegExp("\\b" + small + punct + "$", "ig"), upper));
			
			index = split.lastIndex;
			
			if ( m ) parts.push( m[0] );
			else break;
		}
		
		return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
			.replace(/(['Õ])S\b/ig, "$1s")
			.replace(/\b(AT&T|Q&A)\b/ig, function(all){
				return all.toUpperCase();
			});
	};
    
	function lower(word){
		return word.toLowerCase();
	}
    
	function upper(word){
	  return word.substr(0,1).toUpperCase() + word.substr(1);
	}
})();





/* ----------------------------------------------------------- /
	getClickOrTapLabel	
/ ----------------------------------------------------------- */
function getClickOrTapLabel(){
	report('TEST','--> getClickOrTapLabel()..');	
	try{
		switch(clickOrTouchEvent){
			case 'click':
				return "click";
				break;
			default:
				return "tap";
				break;
		}												
	}catch(e){ catchError('getClickOrTapLabel()',e); }			
}


		
/* --------------------------------------- */
function DecodeHTML(encodedHTML){
	var htmlJSONreply = $("<div/>").html(encodedHTML).text();
	return htmlJSONreply;
}

var shakeTimeout ;

function initDelayedBounce(elementID, milliseconds, overrideDefault){
	report('TEST','initDelayedBounce()...[pageAlreadyVisited:' + pageAlreadyVisited() + ']..');	
	
	$("#"+elementID).removeClass("bounce");			
	window.setTimeout(function(){ $("#"+elementID).addClass("bounce");}, milliseconds);													
}

/* --------------------------------------------*/
function removeSpaces(originalString){						
    var newString = originalString.split(' ').join('');
    return newString;
    //alert(newString);
}

/* --------------------------------------------*/
function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}


/* --------------------------------------------*/
function ellipsisText(strText,nLength){
	if(strText.length > nLength){
		return strText.substring(0,nLength) + "...";
	}else{
		return strText;
	}
}

/* --------------------------------------------*/
function randomRange(min,max) {
	return Math.round(Math.random() * (max-min) + min);
}



function itemHasDisabledStyle(elementID){
    if ($("#" + elementID).attr("class").toLowerCase().indexOf("disable",0) > -1){	
	return true;
    }else{
	return false;
    }    
}


function devMessage(){
	alert('functionality not available yet...');
}

function refreshAllClickEventsToBeTouchEvents(){
	report('TEST','refreshAllClickEventsToBeTouchEvents() --------- Replacing CLICK events with TOUCH events ---------'); // Touch exists... proceeding to hijack all click events...');
	$('a,input[href],div[href],*[onclick]').each(function(e){			
		report('\t ...replacing click events for touch events for [id:' + $(this).attr("id") + ", label:" + $(this).val() + ']');
		new NoClickDelay(this);
	});		
}



/* 
	smarter (mobile) click event handling 
	http://cubiq.org/remove-onclick-delay-on-webkit-for-iphone
*/
function NoClickDelay(el) {
	
	// report('!!!!!!!!!!!!!!!!! NoClickDelay(' + el + ')..');
			
	this.element = typeof el == 'object' ? el : document.getElementById(el);	
	if(usingMobileDevice()) this.element.addEventListener('touchstart', this, false); 
}

NoClickDelay.prototype = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'touchstart': this.onTouchStart(e); break;
			case 'touchmove': this.onTouchMove(e); break;
			case 'touchend': this.onTouchEnd(e); break;
		}
	},

	onTouchStart: function(e) {
		e.preventDefault(); // report('NoClickDelay.onTouchStart()...');						
								
		this.moved = false;

		this.theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		
		// sound effect?
		if($(this.theTarget).hasClass("button")){
			playAudio("assets/audio/click_light_03.wav");
			
		}else if($(this.theTarget).is('[sound]')){ // play 'sound' attribute if exists						
			playAudio($(this.theTarget).attr("sound")); 			 
			
		}else if(
				($(this.theTarget).hasClass('footerButton')) && 
				(!$(this.theTarget).is('[disabled]'))){
					playAudio('assets/audio/click_wood_02.wav'); // only play this effect if button not disabled and is a footer button 
		}else{
			// no sound!
		}		
		
		if(this.theTarget.nodeType == 3) this.theTarget = theTarget.parentNode;
		this.theTarget.className+= ' pressed';

		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
	},

	onTouchMove: function(e) {
		this.moved = true;
		this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
	},

	onTouchEnd: function(e) {		
		//report('NoClickDelay.onTouchEnd()...');
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);

		if( !this.moved && this.theTarget ) {
			this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');			
			var theEvent = document.createEvent('MouseEvents');
			theEvent.initEvent('click', true, true);
			this.theTarget.dispatchEvent(theEvent);				
		}
		this.theTarget = undefined;
	}
};




function pad(number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;
}


function capitalize(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function pluralizeName(nameString){

	var lastLetter = nameString.substring(nameString.length-1,nameString.length);
	report('TEST','pluralizeName()... lastLetter was [' + lastLetter + ']..');
	if(lastLetter.toUpperCase() == "S"){
		return nameString + "'";
	}else{
		return nameString + "'s";		
	}
}




function getCurrentDateString(){
	var dte = new Date();
	return (String(parseInt(dte.getMonth()+1)) + '/' + dte.getDate() + '/' + dte.getFullYear());
}

function getCurrentTimeString(){
	var dte = new Date();
	var _time = getBasicTimeString(dte.getHours(),dte.getMinutes());
	return _time;
}


function screenRefreshNoCache(){
	var timeNow = new Date();
	var timeStamp = timeNow.getHours() + timeNow.getSeconds() + timeNow.getMilliseconds();
	document.location.href = document.location.href + "?NOCACHE=" + timeStamp;
}

/* ------------------------------------ */
function isIE(){ return !!window.ActiveXObject;}

/* ------------------------------------ */
function exploreObject(obj){

	var objInfo = "";
			for(var prop in obj){
				if(typeof(obj[prop]) == "object"){
					for(var oprop in obj[prop]){
						objInfo += "\n\t\t ----- [" + prop + "." + oprop + "] = [" + obj[prop][oprop] + "]";	
					}
				}else{
					objInfo += "\n\t [" + prop + "] = [" + obj[prop] + "]";
				}
				
			}
		
			report('TEST',objInfo);
			return objInfo;
	

}



/* ------------------------------------------- */		
function getTouchedPosition(element,e){

	var x,y;
	if(window.Touch){
		x = endCoords.pageX - $(element).offset().left; //e.targetTouches[0].pageX
		y = endCoords.pageY - $(element).offset().top; //e.targetTouches[0].pageY
	}else{
		x = e.pageX- $(element).offset().left;
		y = e.pageY- $(element).offset().top;
		
	}
	
	// alert('getTouchedPosition()...[' + $(element).attr('id') + ' was touched at [x:' + x + '] [y:' + y + ']');
	report('TEST','getTouchedPosition()...[' + $(element).attr('id') + ' was touched at [x:' + x + '] [y:' + y + ']');
	return {'x':x,'y':y};
	
}


Array.prototype.avg = function() {
var av = 0;
var cnt = 0;
var len = this.length;
for (var i = 0; i < len; i++) {
var e = +this[i];
if(!e && this[i] !== 0 && this[i] !== '0') e--;
if (this[i] == e) {av += e; cnt++;}
}
return av/cnt;
}


function maskHalfString(origString){
	var stringParts = origString.split("");
	var maskedString = "";
	for(var s=0;s<stringParts.length;s++){
		if(s < stringParts.length/2){
			maskedString += "*";
		}else{
			maskedString += stringParts[s];
		}
	}
	
	return maskedString;
}

function maskFrontOfString(origString,charsToReveal){
	var stringParts = origString.split("");
	var maskedString = "";
	for(var s=0;s<stringParts.length;s++){
		if(s < (stringParts.length-charsToReveal)){
			maskedString += "*";
		}else{
			maskedString += stringParts[s];
		}
	}
	return maskedString;
}



/* ----------------------------------------------------------- /
	togglePopup
/ ----------------------------------------------------------- */
function togglePopup(id){
	report('TEST','--> togglePopup(id:' + id + ')..');	
	try{
		if(typeof(focusedPopupID) != 'undefined'){
			$('#'+focusedPopupID).toggle();			
			focusedPopupID = undefined;
		}		
		
		if(!!id){
			focusedPopupID = id;
			$('#'+id).toggle();			
			$('body').addClass('popup_mode'); //$('#app_body').addClass('hidden');
		}else{
			$('.popup').hide();			
			$('body').removeClass('popup_mode'); //$('#app_body').removeClass('hidden');
		}
		
												
	}catch(e){ catchError('togglePopup()',e); }			
}		




/* ----------------------------------------------------------- /
	renderBooleanAsYesOrNo
/ ----------------------------------------------------------- */
function renderBooleanAsYesOrNo(boolean){
	report('VERBOSE','--> renderBooleanAsYesOrNo(' + boolean + ')..');	
	try{
		switch(boolean){
			case true:
				return "YES";
				break;
			case false:
				return "NO";
				break;
		}
												
	}catch(e){ catchError('renderBooleanAsYesOrNo()',e); }			
}


/* ----------------------------------------------------------- /
	appNotBusy
/ ----------------------------------------------------------- */
function appNotBusy(){
	report('TEST','--> appNotBusy()..');	
	try{

		return !($('body').hasClass('processing_mode'));
												
	}catch(e){ catchError('appNotBusy()',e); }			
}


/* ----------------------------------------------------------- /
	showFullSizeImage
/ ----------------------------------------------------------- */
function showFullSizeImage(path){
	report('TEST','--> showFullSizeImage()..');	
	try{

		$('body #fullsize_image').remove();
		var _fullsizeImageDiv = "<div id='fullsize_image'><div class='loading_icon rotate'></div><img src='" + path + "'/><label>Tap anywhere to close screenshot</label></div>";
		$('body').append(_fullsizeImageDiv).addClass('screenshot_view_mode');
		$('#fullsize_image').bind(clickOrTouchEvent,function(){ $(this).remove(); $('body').removeClass('screenshot_view_mode'); });

												
	}catch(e){ catchError('showFullSizeImage()',e); }			
}


/* ----------------------------------------------------------- /
	getThreeDigitIDFromInteger
/ ----------------------------------------------------------- */
function getThreeDigitIDFromInteger(strInt){
	report('VERBOSE','--> getThreeDigitIDFromInteger()..');	
	try{
		// if(parseInt(strInt) == "NaN") return strInt;
		// strInt = parseInt(strInt);
		var _ID = "";

		if(strInt.length < 2){ // if(strInt < 10){ 
			_ID = "00" + strInt; 
		}else if(strInt.length < 3){ //}else if(strInt < 100){
			_ID = "0" + strInt;
		}else{
			_ID = strInt;
		}

		return _ID
												
	}catch(e){ catchError('getThreeDigitIDFromInteger()',e); }			
}


function isDebugMode(specialCase){
	
	try{

		var querystringflag = false;
		var devEmailInUse = false;	
		var _isDebugMode = false;

		if(specialCase == 'USE_INIT_STATE') return debugInitialState;

		try{		
			// QUERYSTRING 
			if(document.location.href.toUpperCase().indexOf('DEBUG',0) > -1) querystringflag = true;		
			if(specialCase == 'QUERYSTRING') return querystringflag;

			// OTHER METHOD
			var otherVariableToCheck = false;

			_isDebugMode = ((querystringflag) || (otherVariableToCheck));		
		}catch(e){
			_isDebugMode = false;	
		}
		return _isDebugMode;

	}catch(e){ catchError('isDebugMode()',e); }			

} 



function browserDetection(){
    if((navigator.appVersion.toLowerCase().indexOf("safari",0) == -1) &&
    (navigator.appVersion.toLowerCase().indexOf("webkit",0) == -1)){
        return false;
    }
    return true;
}



/* ---------------------------------- */
function resetVideo(videoID){
	report('resetVideo(videoID:' + videoID + ')...');	
	try{
		var video = document.getElementById(videoID);
		video.setAttribute("src", "");						
		video.pause();
		video.stop();			
	}
	catch(e){
		// video likely doesnt exist/not init yet		
	}
}