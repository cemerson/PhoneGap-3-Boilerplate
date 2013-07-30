PhoneGap-3-Boilerplate
======================

#Overview
Here's my humble stab at setting up and maintaining a bare bones PhoneGap 3.x project structure with the plugins* I normally use (*official plugins and others I've modified myself). 

This will likely be a WIP for a while - but the main thing in the initial version I wanted to get finished/released asap was getting the main plugins I normally use working with CDV 3.0 and in a 'ready-to-use' form. At the time I'm writing this up some of the plugins used are indeed CDV 3.0 compatible - but others are not (including important ones like how I need to view URLs and PDFs). Long story short is that this project contains a bare bones CDV 3.0 app project root folder structure that includes the following plugins and some test methods ([js/tests.js](https://github.com/cemerson/PhoneGap-3-Boilerplate/blob/master/js/tests.js)):

#Video:
See a quick video run-through of the PhoneGap 3 Boilerplate (in iOS Simulator) here:

[![ScreenShot](https://secure-b.vimeocdn.com/ts/444/874/444874862_295.jpg)](https://vimeo.com/71345312)


###Official Plugins 
(plugins I didn't have to alter myself - all came directly from latest git repos maintained by the Cordova team)
- **Device** [reference](http://docs.phonegap.com/en/3.0.0/cordova_device_device.md.html#Device)
- **Console** 
- **Network-Information** [reference](http://docs.phonegap.com/en/3.0.0/cordova_connection_connection.md.html#Connection)
- **SplashScreen** [reference](http://docs.phonegap.com/en/3.0.0/cordova_splashscreen_splashscreen.md.html#Splashscreen)
- **Notification** [reference](http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#Notification)

###CE-Altered Plugins 
(The original authors of these may/may not update these eventually - but my copies are working in CDV 3.0 today)
- **Badge** [reference](https://github.com/cemerson/cordova-badge)
- **PowerManagement** [reference](https://github.com/cemerson/cordova-powermanagement)
- **SecureDeviceIdentifier** [reference](https://github.com/cemerson/cordova-securedeviceidentifier)
- **InAppBrowser** [reference](https://github.com/cemerson/cordova-inappbrowser-ce)


#Plugin Notes

All the plugins listed above work as normal so nothing really to explain outside the usage shown in the js/tests.js file. Adding/removing the latest version of each plugin requires using the Cordova CLI. The only thing that is worth mentioning here is a few things around the InAppBrowser plugin being used. 

InAppBrowser is an official Cordova-maintained plugin and is currently CDV 3.0 compatible
However it currently doesn't allow "windowed" mode as my previous versions of ChildBrowser did so I've taken the latest version and modified it to take some additional parameters to allow the specification of width, height, xpos and ypos. Example usage/etc can be seen in the js/tests.js or at the git page (https://github.com/cemerson/cordova-inappbrowser-ce).
I also threw in the ability to provide a button background color as a parameter if the default blue doesn't match the app's skin - syntax also shown on the git page.


#Usage

To grab a copy of the PhoneGap 3 Boilerplate (on OSX) jump to Terminal and change to whatever directory you want to place your project and type the following ("MyFolder" being what the local destination folder should be named): 

    git clone https://github.com/cemerson/PhoneGap-3-Boilerplate.git MyFolder


Next step to add an iOS project type the following:

    cd MyFolder
    cordova platform add ios
    cordova prepare

From that point on, modify and test the files in the MyFolder/www folder and when you want to refresh the iOS build return to the Terminal (in "MyFolder" folder) and type:

    cordova build

This will push your MyFolder/www changes down to the iOS build and actually test the Xcode build via command line.
