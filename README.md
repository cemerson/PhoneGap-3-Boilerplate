PhoneGap-3-Boilerplate
======================

#Updates

20131106:

- Added audio/video section using my [cordova-mediaPlayer-core](https://github.com/cemerson/cordova-mediaplayer-core) files as a submodule.
- Note: I've deleted my old Cordova-MediaPlayer repo. This will be the only project where my [cordova-mediaPlayer-core](https://github.com/cemerson/cordova-mediaplayer-core) files are integrated/demonstrated from now on.
- Added orange GIT links for each plugin/section

#Overview

Here's my humble stab at setting up and maintaining a bare bones PhoneGap 3.x project structure with the plugins* I normally use (*official plugins and others I've modified myself).

This will likely be a WIP for a while - but the main thing in the initial version I wanted to get finished/released asap was getting the main plugins I normally use working with CDV 3.0 and in a 'ready-to-use' form. At the time I'm writing this up some of the plugins used are indeed CDV 3.0 compatible - but others are not (including important ones like how I need to view URLs and PDFs). Long story short is that this project contains a bare bones CDV 3.0 app project root folder structure that includes the following plugins and some test methods ([js/tests.js](https://github.com/cemerson/PhoneGap-3-Boilerplate/blob/master/js/tests.js)):

#Screenshot

[![ScreenShot](https://raw.github.com/cemerson/PhoneGap-3-Boilerplate/master/artwork/PhoneGap-3-Boilerplate.png)

###Official Plugins
Note: All plugins are now submodules that point to their original (current) repositories.

#####Plugins I didn't have to alter myself - all came directly from latest git repos maintained by the Cordova team)
- **Device** [reference](http://docs.phonegap.com/en/3.0.0/cordova_device_device.md.html#Device)
- **Console**
- **Network-Information** [reference](http://docs.phonegap.com/en/3.0.0/cordova_connection_connection.md.html#Connection)
- **SplashScreen** [reference](http://docs.phonegap.com/en/3.0.0/cordova_splashscreen_splashscreen.md.html#Splashscreen)
- **Notification** [reference](http://docs.phonegap.com/en/3.0.0/cordova_notification_notification.md.html#Notification)

#####Plugins I've Modified
(The original authors of these may/may not update these eventually - but my copies are working in CDV 3.0 today)
- **Badge** [reference](https://github.com/cemerson/cordova-badge)
- **PowerManagement** [reference](https://github.com/cemerson/cordova-powermanagement)
- **SecureDeviceIdentifier** [reference](https://github.com/cemerson/cordova-securedeviceidentifier)
- **InAppBrowser** [reference](https://github.com/cemerson/cordova-inappbrowser-ce)


All the plugins listed above work as normal so nothing really to explain outside the usage shown in the js/tests.js file. Adding/removing the latest version of each plugin requires using the Cordova CLI. The only thing that is worth mentioning here is a few things around the InAppBrowser plugin being used.

InAppBrowser is an official Cordova-maintained plugin and is currently CDV 3.0 compatible
However it currently doesn't allow "windowed" mode as my previous versions of ChildBrowser did so I've taken the latest version and modified it to take some additional parameters to allow the specification of width, height, xpos and ypos. Example usage/etc can be seen in the js/tests.js or at the git page (https://github.com/cemerson/cordova-inappbrowser-ce).
I also threw in the ability to provide a button background color as a parameter if the default blue doesn't match the app's skin - syntax also shown on the git page.


#Usage

**Please Note that setting up a new PhoneGap 3 Boilerplate folder per the below Terminal commands will nuke any files you have there already - so it's best to start with a new directory and move any existing files you need in after setting everything up.**

Make sure cordova 3 is installed first ([instructions here](http://docs.phonegap.com/en/3.0.0/guide_cli_index.md.html#The%20Command-line%20Interface)).

To grab a copy of the PhoneGap 3 Boilerplate (on OSX) jump to Terminal and change to whatever directory you want to place your project and type the following ("MyFolder" being what the local destination folder should be named):

    cordova create PG3BP
    cd PG3BP
    git clone --recursive https://github.com/cemerson/PhoneGap-3-Boilerplate.git tmp && mv tmp/.git . && rm -rf tmp && git reset --hard

To take a look at things now you can type the following to confirm the PhoneGap 3 Boilerplate plugins are indeed there and that no platforms are setup yet for the project:

    cordova plugins ls
    cordova platforms ls

Next step to add an iOS project type the following:

    cordova platform add ios

At this point a Xcode project has been setup so you can test/build that when ready. From this point on, modify and test the files in the PG3BP/www folder and when you want to refresh the iOS build return to the Terminal (in "PG3BP" folder) and type:

    cordova build

This will push your PG3BP/www changes down to the iOS build and actually test the Xcode build via command line.

When you want to do fresh pull of main repo

    git pull origin master

### Submodule Stuff

*Warning: Playing with submodule stuff assumes you are crazy as me and/or a super elite git user*

I am no pro at git submodules - but I do find them useful/necessary for avoiding version control insanity and a general means of keeping things packaged neatly. For that reason I've made all plugins in this project submodules that can be updated if/when the developer wants to do so.

To update all submodules from their source run these commands from the parent folder at any time:

    git submodule update --init
    git submodule foreach git pull origin master

If anyone has trouble w/the plugins - here's a (partial) list of plugin submodule commands I've run. If a plugin namespace or path changes, this list of commands might come in helpful. For example the Cordova team removed the word ".core" from the namespace of a handful of their plugins recently - so I had to use these commands to re-add these submodules to this project (fun!.. not).

    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-device.git plugins/org.apache.cordova.device
    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-network-information.git plugins/org.apache.cordova.network-information
    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-battery-status.git plugins/org.apache.cordova.battery-status
    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-media.git plugins/org.apache.cordova.media
    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-dialogs.git plugins/org.apache.cordova.dialogs
    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-splashscreen.git plugins/org.apache.cordova.splashscreen
    git submodule add https://git-wip-us.apache.org/repos/asf/cordova-plugin-console.git plugins/org.apache.cordova.console


#Video:

To be updated...
