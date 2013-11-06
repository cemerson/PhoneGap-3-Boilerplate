var badgeToggledOn = false;
var autoLockIsDisabled = false;
var cdvBadge = null;

/* ----------------------------------------------------------- /
 populateDeviceInfo
 / ----------------------------------------------------------- */
function populateDeviceInfo(){
    report('TEST','--> populateDeviceInfo()..');
    try{
        $('#device_platform span').html(getDevicePlatform());
        $('#device_model span').html(getDeviceModel());
        $('#device_os span').html(getOS());
        $('#device_version span').html(getDeviceVersion());
        $('#device_conn span').html(getConnectionType());
        $('#device_internet span').html(isConnectedToInternet());
    }catch(e){ catchError('populateDeviceInfo()',e); }
}

function initTests(){
    report('TEST','--> initTests()..');

    initOrResetCordovaMediaPlayer();

        $(document).ready(function(){
            $('.gitlink').bind(clickOrTouchEvent,function(){
                var link = $(this).attr('href');
                window.open(link,'_blank');
            });
        });

    populateDeviceInfo();
}

/* --------------------------------------- */
function initOrResetCordovaMediaPlayer(){

    var w = 260;
    var h = 190;
    if(window.innerWidth > 800){
        w = 640;
        h = 480;
    }

    setupCordovaMediaPlayer(w,
                            h,
                            'Cordova Media Player',
                            '',
                            'js/cordova-mediaplayer/example-media/default.png');
}


/* --------------------------------------- */
function test_ResetCordovaMediaPlayer(){

    _closeMediaPlayer();
    initOrResetCordovaMediaPlayer();

}

/* ----------------------------------------------------------- /
 test_VideoRemote
 / ----------------------------------------------------------- */
function test_VideoRemote(){
    report('TEST','--> test_VideoRemote()..');
    try{


        initMediaPlayerForVideo("VIDEO: Remote Example (HTTP://)",
                                "http://blog.chris-emerson.net/wp-content/video/trailer.mp4",
                                "http://blog.chris-emerson.net/wp-content/video/thumb.jpg",
                                "Video (and thumbnail) coming from a URL source.");


    }catch(e){ catchError('test_VideoRemote()',e); }
}

/* ----------------------------------------------------------- /
 test_VideoLocal
 / ----------------------------------------------------------- */
function test_VideoLocal(){
    report('TEST','--> test_VideoLocal()..');
    try{

        initMediaPlayerForVideo("VIDEO: Local Example (FILE:\\\\)",
                                "js/cordova-mediaplayer/example-media/example_video.mp4",
                                "js/cordova-mediaplayer/example-media/example_video.png",
                                "Video (and thumbnail) coming from the local assets folder.");


    }catch(e){ catchError('test_VideoLocal()',e); }
}


/* ----------------------------------------------------------- /
 test_AudioLocal
 / ----------------------------------------------------------- */
function test_AudioLocal(){
    report('TEST','--> test_AudioLocal()..');
    try{

        initMediaPlayerForAudio("AUDIO: Local Example (FILE:\\\\)",
                                "js/cordova-mediaplayer/example-media/example_audio.mp3",
                                "js/cordova-mediaplayer/example-media/example_audio.jpg",
                                "Audio (and thumbnail) coming from the local assets folder.");

    }catch(e){ catchError('test_AudioLocal()',e); }
}

/* ----------------------------------------------------------- /
 test_AudioRemote
 / ----------------------------------------------------------- */
function test_AudioRemote(){
    report('TEST','--> test_AudioRemote()..');
    try{

        initMediaPlayerForAudio("AUDIO: Remote Example (HTTP://)",
                                "http://blog.chris-emerson.net/wp-content/audio/example.mp3",
                                "http://blog.chris-emerson.net/wp-content/audio/thumb.jpg",
                                "Audio (and thumbnail) coming from a URL source.");

    }catch(e){ catchError('test_AudioRemote()',e); }
}



/* ----------------------------------------------------------- /
 splashScreenTest
 / ----------------------------------------------------------- */
function test_SplashScreen(){
    report('TEST','--> splashScreenTest()..');
    try{
        if(!cordovaIsLoaded){
            doAlert('Sorry: The [SplashScreen] plugin only works on an actual device.','Plugin Error');
            return false;
        }
        doAlert('App splashscreen will now be shown for a few seconds, then dismissed. If something goes wrong you\'ll have to exit the app manually.','cordova-splashscreen');
        cordova.exec(null, null, 'SplashScreen', 'show', []);
        var splashClear = window.setTimeout(function(){
                                            cordova.exec(null, null, 'SplashScreen', 'hide', []);
                                            },2500);

    }catch(e){ catchError('splashScreenTest()',e); }
}


/* ----------------------------------------------------------- /
 test_InAppBrowser
 / ----------------------------------------------------------- */
function test_InAppBrowser_WithOptions(){
    report('TEST','--> test_InAppBrowser()..');
    try{

        if(!cordovaIsLoaded){
            doAlert('Please Note: The [InAppBrowser] plugin\'s dimension and position parameters only work on an actual device.','Plugin Note');
        }


        var windowHeight, windowWidth, viewX, viewY;
        var iab;
        viewX = 200;
        viewY = 0;
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth-200;

        iab = window.open('http://www.ign.com','_blank',
                              'enableviewportscale=yes,' +
                              'location=yes,' +
                              'vw=' + windowWidth + ',' +
                              'vh=' + windowHeight + ',' +
                              'vx=' + viewX + ',' +
                              'vy=' + viewY);
        iab.addEventListener('loadstart', function(){ $('body').addClass('inappbrowser_windowed_mode'); });
        iab.addEventListener('exit', function(){ $('body').removeClass('inappbrowser_windowed_mode'); });

    }catch(e){ catchError('test_InAppBrowser()',e); }
}

/* ----------------------------------------------------------- /
 test_InAppBrowser_NoOptions
 / ----------------------------------------------------------- */
function test_InAppBrowser_NoOptions(){
    report('TEST','--> test_InAppBrowser_NoOptions()..');
    try{
        //doAlert('Website will now be opened via InAppBrowser [window.open]','cordova-inappbrowser');
        window.open('http://www.ign.com','_blank','fullscreenbuttonenabled=no');
    }catch(e){ catchError('test_InAppBrowser_NoOptions()',e); }
}


/* ----------------------------------------------------------- /
 test_PDFBrowser
 / ----------------------------------------------------------- */
function test_PDFBrowser(){
    report('TEST','--> test_PDFBrowser()..');
    try{

        var pdfView;
        var windowHeight, windowWidth, viewX, viewY;
        viewX = 0;
        viewY = 0;
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;

        pdfView = window.open('pdf/example.pdf','_blank',
                              'enableviewportscale=yes,fullscreenbuttonenabled=no,' +
                              'location=no,' +
                              'vw=' + windowWidth + ',' +
                              'vh=' + windowHeight + ',' +
                              'vx=' + viewX + ',' +
                              'vy=' + viewY);

        //pdfView.addEventListener('loadstart', function(){ setBodyPDFClass(); });
        //pdfView.addEventListener('exit', function(){ pdfView.close(); clearBodyPDFClass(); });


    }catch(e){ catchError('test_PDFBrowser()',e); }
}




/* ----------------------------------------------------------- /
 test_PDFBrowser_Form
 / ----------------------------------------------------------- */
function test_PDFBrowser_Form(){
    report('TEST','--> test_PDFBrowser_Form()..');
    try{
        if(!cordovaIsLoaded){
            doAlert('Please Note: The [InAppBrowser] plugin\'s dimension and position parameters only work on an actual device.','Plugin Note');
        }
        window.open('pdf/example.pdf','_blank','enableviewportscale=yes,presentationstyle=formsheet');

    }catch(e){ catchError('test_PDFBrowser_Form()',e); }
}


/* ----------------------------------------------------------- /
 test_PDFBrowser_Vertical
 / ----------------------------------------------------------- */
function test_PDFBrowser_Vertical(){
    report('TEST','--> test_PDFBrowser_Vertical()..');
    try{

        var pdfView;
        var windowHeight, windowWidth, viewX, viewY;
        viewX = 0;
        viewY = (window.innerHeight*.35)/2;
        windowHeight = window.innerHeight*.65;
        windowWidth = window.innerWidth;

        pdfView = window.open('pdf/example.pdf','_blank',
                              'enableviewportscale=yes,' +
                              'location=no,' +
                              'vw=' + windowWidth + ',' +
                              'vh=' + windowHeight + ',' +
                              'vx=' + viewX + ',' +
                              'vy=' + viewY);

    }catch(e){ catchError('test_PDFBrowser_Vertical()',e); }
}



/* ----------------------------------------------------------- /
 test_PDF_Windowed
 / ----------------------------------------------------------- */
function test_PDF_Windowed(){
    report('TEST','--> test_PDF_Windowed()..');
    try{

        if(!cordovaIsLoaded){
            doAlert('Please Note: The [InAppBrowser] plugin\'s dimension and position parameters only work on an actual device.','Plugin Note');
        }

        var windowHeight, windowWidth;
        var viewX = window.innerWidth*.05;
        var viewY = 0;
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth*.90;

        var pdfView = window.open('pdf/example.pdf','_blank',
                              'enableviewportscale=yes,' +
                              'location=no,' +
                              'vw=' + windowWidth + ',' +
                              'vh=' + windowHeight + ',' +
                              'vx=' + viewX + ',' +
                              'vy=' + viewY);
        pdfView.addEventListener('loadstart', function(){ $('body').addClass('inappbrowser_windowed_mode'); });
        pdfView.addEventListener('exit', function(){ $('body').removeClass('inappbrowser_windowed_mode'); });

    }catch(e){ catchError('test_PDF_Windowed()',e); }
}




function test_SDID(){
    report('TEST','--> test_SDID()..');
    try{
        if(!cordovaIsLoaded){
            doAlert('Sorry: The [SecureDeviceIdentifier] plugin only works on an actual device.','Plugin Error');
            return false;
        }
        getDeviceID();
        var id = window.setTimeout(function(){
                                   report('TEST','deviceSDID: ' + deviceSDID + '...');
                                   $('#device_id').html(deviceSDID);
                                   },1000);
        doAlert('Unique Device ID will be retrieved momentarily - please wait.','cordova-securedeviceidentifier');


    }catch(e){ catchError('test_SDID()',e); }
}

/* ----------------------------------------------------------- /
 test_PowerManagement
 / ----------------------------------------------------------- */
function test_PowerManagement(){
    report('TEST','--> test_PowerManagement()..');
    try{

        if(!cordovaIsLoaded){
            doAlert('Sorry: The [PowerManagement] plugin only works on an actual device.','Plugin Error');
            return false;
        }


        if(!autoLockIsDisabled){
            PWpreventAutoLock();
            autoLockIsDisabled = true;
            $('#powermgmt_status').html('AUTO DIM/LOCK: <b>DISABLED</b>');
            doAlert('App will now PREVENT auto lock/auto dim. Please wait a 30-60 seconds to confirm.','cordova-powermanagement');
        }else{
            PWreenableAutoLock();
            autoLockIsDisabled = false;
            $('#powermgmt_status').html('AUTO DIM/LOCK: <b>ENABLED</b>');
            doAlert('App will now ALLOW auto lock/auto dim as normal. Please wait a 30-60 seconds to confirm.','cordova-powermanagement');
        }

    }catch(e){ catchError('test_PowerManagement()',e); }
}


/* ----------------------------------------------------------- /
 test_Badge
 / ----------------------------------------------------------- */
function test_Badge(){

    try{

        if(!cordovaIsLoaded){
            doAlert('Sorry: The [Badge] plugin only works on an actual device.','Plugin Error');
            return false;
        }

        cdvBadge = window.plugins.badge;

        report('TEST','--> test_Badge().. [cdvBadge:' + cdvBadge + '?]');

        if(badgeToggledOn){
            if(cdvBadge != undefined){
                cdvBadge.set(0);
                cdvBadge.clear();
            }
            doAlert('App Icon Badge Removed!\n\nExit app to confirm.','cordova-badge');
            badgeToggledOn = false;

        }else{
            if(cdvBadge != undefined) cdvBadge.set(1);
            doAlert('App Icon Badge Added!\n\nExit app to confirm.','cordova-badge');
            badgeToggledOn = true;
        }

    }catch(e){ catchError('test_Badge()',e); }
}

/* DEBUG */ window.console.log('js/tests.js loaded...');



