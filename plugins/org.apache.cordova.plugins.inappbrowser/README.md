cordova-plugin-inappbrowser
-----------------------------
To install this plugin, follow the [Command-line Interface Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface).

###Notes:
- Main reason I updated this plugin is to maintain the ability to specify Width/Height and Xposition/YPosition of my web views. I had it working in the Cordova 2.x world - but this updated version blew that all up so I had to go in and hack things up to get it working again. I am not an ace ObjC programmer by any stretch - so please share whatever adjustments, clean-up or polish suggestions if anyone has any! 
([Reference @StackExchange link here...](http://stackoverflow.com/questions/17886218/how-to-set-transparent-background-with-inappbrowser/18228718#18228718]))

- For some reason CoreGraphics framework isn't being auto added to project (even thought its specified in the plugin.xml so it has to be manually added when using this plugin otherwise you'll get a build error.

###Install Plugin
cordova plugins add https://github.com/cemerson/cordova-inappbrowser-ce.git

###Remove Plugin
cordova plugins rm org.apache.cordova.plugins.inappbrowser

###Parameter Notes
The primary custom parameters I've added to this plugin are:
- **vw** (view width)
- **vh** (view height)
- **vx** (view x position (offset))
- **vy** (view y position (offset))
- **buttoncolorbg** (close button background color);
- **fullscreenwhenrotated** (resizes web view to fit entire screen on rotate, defaults to: yes);
- **fullscreenbuttonenabled** (adds a full screen toggle button on far right of toolbar, defaults to: yes);;

###Usage Examples:
####PDF in Split-View (Pseudo) Layout:
    window.open('document.pdf','_blank','vw=800,vh=768,vx=224,vy=0,buttoncolorbg=#BA8C3C');

####Web Page in Window:
    window.open('http://www.ign.com','_blank','vw=568,vh=768,vx=200,vy=0,buttoncolorbg=#BA8C3C');

####Standard/Default (fullscreen UIWebView):
    window.open('http://www.ign.com','_blank');
