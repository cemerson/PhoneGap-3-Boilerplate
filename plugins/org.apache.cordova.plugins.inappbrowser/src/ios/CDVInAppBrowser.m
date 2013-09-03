/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVInAppBrowser.h"
#import <Cordova/CDVPluginResult.h>
#import <Cordova/CDVUserAgentUtil.h>
#import <Cordova/CDVJSON.h>

#define    kInAppBrowserTargetSelf @"_self"
#define    kInAppBrowserTargetSystem @"_system"
#define    kInAppBrowserTargetBlank @"_blank"

#define    TOOLBAR_HEIGHT 44.0
#define    LOCATIONBAR_HEIGHT 21.0
#define    FOOTER_HEIGHT ((TOOLBAR_HEIGHT) + (LOCATIONBAR_HEIGHT))
#define    BUTTON_BACKGROUND_COLOR @"#448EE3"

#pragma mark CDVInAppBrowser

CDVInAppBrowserViewController *vc;
CDVInAppBrowserViewController *iabvc;
CDVInAppBrowser *iab;

BOOL WINDOWED_MODE_ENABLED;
int VIEW_WIDTH;
int VIEW_HEIGHT;
int VIEW_XPOS;
int VIEW_YPOS;
BOOL IN_ROTATED_MODE;
BOOL FULLSCREEN_WHEN_ROTATED;
BOOL FULLSCREEN_BUTTON_ENABLED;
BOOL IN_FULLSCREEN_MODE;
BOOL HAS_ANIMATED;
NSString *CLOSE_BUTTON_LABEL = @"Done";

@implementation CDVInAppBrowser

- (CDVInAppBrowser*)initWithWebView:(UIWebView*)theWebView
{
    self = [super initWithWebView:theWebView];
    
    iab = self;
    
    return self;
}

- (void)onReset
{
    [self close:nil];
}

- (void)close:(CDVInvokedUrlCommand*)command
{
    NSLog(@"--> CDVInAppBrowser.close()");
    
    if (self.inAppBrowserViewController != nil) {
        [self.inAppBrowserViewController close];
        self.inAppBrowserViewController = nil;
    }
    
    self.callbackId = nil;
    
    [self cleanUpViews];
}

- (void) cleanUpViews{
    [iabvc.view.subviews makeObjectsPerformSelector: @selector(removeFromSuperview)];
    
    [iabvc.view removeFromSuperview];
    
    [iab.viewController removeFromParentViewController];
    
    NSLog(@"SUB VIEW LIST #3(FINAL):");
    [self listSubviewsOfView:iabvc.view];
    
    [iabvc viewDidUnload];
}

- (BOOL) isSystemUrl:(NSURL*)url
{
    if ([[url host] isEqualToString:@"itunes.apple.com"]) {
        return YES;
    }
    
    return NO;
}

- (void)open:(CDVInvokedUrlCommand*)command
{
    
	dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
		dispatch_async(dispatch_get_main_queue(), ^(void) {
            
            
            
            CDVPluginResult* pluginResult;
            
            NSString* url = [command argumentAtIndex:0];
            NSString* target = [command argumentAtIndex:1 withDefault:kInAppBrowserTargetSelf];
            NSString* options = [command argumentAtIndex:2 withDefault:@"" andClass:[NSString class]];
            
            if([options rangeOfString:@"fullscreenbuttonenabled=no"].location == NSNotFound){
                FULLSCREEN_BUTTON_ENABLED = YES;
            }else{
                FULLSCREEN_BUTTON_ENABLED = NO;
            }
            
            // Determine [WINDOWED_MODE_ENABLED] value
            if (
                ([options rangeOfString:@"vw"].location == NSNotFound) &&
                ([options rangeOfString:@"vh"].location == NSNotFound) &&
                ([options rangeOfString:@"vx"].location == NSNotFound) &&
                ([options rangeOfString:@"vy"].location == NSNotFound)
                ){
                WINDOWED_MODE_ENABLED = NO; // no view x,y,w,h settings provided, assume MODAL method
            }else{
                WINDOWED_MODE_ENABLED = YES; // some view x,y,w,h settings provided, assume ADDSUBVIEW method
            }
            
            NSLog(@"--> InAppBrowser.open()\n\tWINDOWED_MODE_ENABLED:%i", WINDOWED_MODE_ENABLED);
            
            self.callbackId = command.callbackId;
            
            if (url != nil) {
                NSURL* baseUrl = [self.webView.request URL];
                NSURL* absoluteUrl = [[NSURL URLWithString:url relativeToURL:baseUrl] absoluteURL];
                
                if ([self isSystemUrl:absoluteUrl]) {
                    target = kInAppBrowserTargetSystem;
                }
                
                if ([target isEqualToString:kInAppBrowserTargetSelf]) {
                    [self openInCordovaWebView:absoluteUrl withOptions:options];
                } else if ([target isEqualToString:kInAppBrowserTargetSystem]) {
                    [self openInSystem:absoluteUrl];
                } else { // _blank or anything else
                    [self openInInAppBrowser:absoluteUrl withOptions:options];
                }
                
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            } else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"incorrect number of arguments"];
            }
            
            [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            
            
	    });
	});
    
}


-(CGRect)currentScreenBoundsDependOnOrientation
{
    
    CGRect screenBounds = [UIScreen mainScreen].bounds ;
    CGFloat width = CGRectGetWidth(screenBounds)  ;
    CGFloat height = CGRectGetHeight(screenBounds) ;
    UIInterfaceOrientation interfaceOrientation = [UIApplication sharedApplication].statusBarOrientation;
    
    if(UIInterfaceOrientationIsPortrait(interfaceOrientation)){
        screenBounds.size = CGSizeMake(width, height);
    }else if(UIInterfaceOrientationIsLandscape(interfaceOrientation)){
        screenBounds.size = CGSizeMake(height, width);
    }
    return screenBounds ;
}

- (void) initOrRefreshViewSizeAndBounds{
    
    /*DEBUG*/ //NSLog(@"CDVInAppBrowser.initOrRefreshViewSizeAndBounds()...IN_ROTATED_MODE:%d | IN_FULLSCREEN_MODE:%d | WINDOWED_MODE_ENABLED:%d",IN_ROTATED_MODE, IN_FULLSCREEN_MODE, WINDOWED_MODE_ENABLED);
    
    int w = 0;
    int h = 0;
    int x = 0;
    int y = 0;
    int deviceW = [iab currentScreenBoundsDependOnOrientation].size.width;
    int deviceH = [iab currentScreenBoundsDependOnOrientation].size.height;
    
    if(!WINDOWED_MODE_ENABLED){
        /*DEBUG*/ //NSLog(@" ... fullscreen/modal mode");
        
        w = deviceW;
        h = deviceH;
        x = 0;
        y = 0;
        
    }else{
        
        vc = (CDVInAppBrowserViewController*)[ super viewController ];
        
        /*DEBUG*/ //NSLog(@" ... windowed mode");
        if((IN_ROTATED_MODE) || (IN_FULLSCREEN_MODE)){
            /*DEBUG*/ //NSLog(@" ...... rotated or fullscreen-toggeled mode");
            w = deviceW;
            h = deviceH;
            x = 0;
            y = 0;
        }else{
            /*DEBUG*/ //NSLog(@" ...... default view mode");
            w = VIEW_WIDTH;
            h = VIEW_HEIGHT;
            x = VIEW_XPOS;
            y = VIEW_YPOS;
        }
    }
    
    
    NSLog(@"--> CDVInAppBrowser.initOrRefreshViewSizeAndBounds()\n\tView Settings:\n\t\tWidth:%d\n\t\tHeight:%d\n\t\tXPosition:%d\n\t\tYPosition:%d",
          w,h,x,y);
    
    CGRect vcBoundsInit = CGRectMake(x,
                                     h+FOOTER_HEIGHT,
                                     w,
                                     h);
    
    CGRect webViewBounds = CGRectMake(0,
                                      0,
                                      w,
                                      h-3 // -3 is to hide PDF from showing under toolbar sometimes
                                      );
    
    CGRect vcBounds = CGRectMake(x,
                                 y,
                                 w,
                                 h);
    
    iabvc.view.frame = vcBoundsInit;
    
    iabvc.webView.frame = webViewBounds;
    
    [iabvc.view setAutoresizesSubviews:YES];
    [iabvc.webView setAutoresizingMask:UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth];
    
    
    if(WINDOWED_MODE_ENABLED){
        // NEW addSubView APPROACH (non-modal method)
        
        [iabvc viewWillAppear:NO];
        [vc.self.view addSubview:iabvc.view];
        
        if(!HAS_ANIMATED){
            [UIView beginAnimations:nil context:nil];
            [UIView setAnimationDuration:0.30];
            [UIView setAnimationCurve:UIViewAnimationCurveEaseIn];
            
            iabvc.view.frame = vcBounds;
            [UIView commitAnimations];
            HAS_ANIMATED = YES;
        }else{
            iabvc.view.frame = vcBounds;
        }
        
        // refresh fullscreen button on rotate/view change
        [iabvc initOrRefreshFullscreenButton];
        
    }else{
        // OLD presentModalViewController APPROACH
        [self.viewController presentModalViewController:self.inAppBrowserViewController animated:YES];
    }
    
    // DEBUG to check subviews
    // [self listSubviewsOfView:iabvc.view];
    
}


- (void)openInInAppBrowser:(NSURL*)url withOptions:(NSString*)options
{
    
    if (self.inAppBrowserViewController == nil) {
        NSString* originalUA = [CDVUserAgentUtil originalUserAgent];
        self.inAppBrowserViewController = [[CDVInAppBrowserViewController alloc] initWithUserAgent:originalUA prevUserAgent:[self.commandDelegate userAgent]];
        self.inAppBrowserViewController.navigationDelegate = self;
        
        if ([self.viewController conformsToProtocol:@protocol(CDVScreenOrientationDelegate)]) {
            self.inAppBrowserViewController.orientationDelegate = (UIViewController <CDVScreenOrientationDelegate>*)self.viewController;
        }
    }
    
    // set pointer to this viewcontroller for later use
    iabvc = self.inAppBrowserViewController;
    
    CDVInAppBrowserOptions* browserOptions = [CDVInAppBrowserOptions parseOptions:options];
    [self.inAppBrowserViewController showLocationBar:browserOptions.location];
    [self.inAppBrowserViewController showToolBar:browserOptions.toolbar];
    
    // process the browserOptions data
    browserOptions.vh -= browserOptions.vy;
    FULLSCREEN_WHEN_ROTATED = browserOptions.fullscreenwhenrotated;
    FULLSCREEN_BUTTON_ENABLED = browserOptions.fullscreenbuttonenabled;
    
    VIEW_WIDTH = browserOptions.vw;
    VIEW_HEIGHT = browserOptions.vh;
    VIEW_XPOS = browserOptions.vx;
    VIEW_YPOS = browserOptions.vy;
    
    // configure CLOSE and FULLSCREEN buttons
    [self.inAppBrowserViewController configureCloseButton:browserOptions.closebuttoncaption buttonBGColor:browserOptions.buttoncolorbg];
    
    if((WINDOWED_MODE_ENABLED) && (FULLSCREEN_BUTTON_ENABLED)) [self.inAppBrowserViewController initOrRefreshFullscreenButton];
    
    // Set Presentation Style
    UIModalPresentationStyle presentationStyle = UIModalPresentationFullScreen; // default
    if (browserOptions.presentationstyle != nil) {
        if ([[browserOptions.presentationstyle lowercaseString] isEqualToString:@"pagesheet"]) {
            presentationStyle = UIModalPresentationPageSheet;
        } else if ([[browserOptions.presentationstyle lowercaseString] isEqualToString:@"formsheet"]) {
            presentationStyle = UIModalPresentationFormSheet;
        }
    }
    // NSLog(@"PLUGIN: InAppBrowser.presentationStyle = %@",browserOptions.presentationstyle);
    self.inAppBrowserViewController.modalPresentationStyle = presentationStyle;
    
    // Set Transition Style
    UIModalTransitionStyle transitionStyle = UIModalTransitionStyleCoverVertical; // default
    if (browserOptions.transitionstyle != nil) {
        if ([[browserOptions.transitionstyle lowercaseString] isEqualToString:@"fliphorizontal"]) {
            transitionStyle = UIModalTransitionStyleFlipHorizontal;
        } else if ([[browserOptions.transitionstyle lowercaseString] isEqualToString:@"crossdissolve"]) {
            transitionStyle = UIModalTransitionStyleCrossDissolve;
        }
    }
    self.inAppBrowserViewController.modalTransitionStyle = transitionStyle;
    
    // UIWebView options
    self.inAppBrowserViewController.webView.scalesPageToFit = browserOptions.enableviewportscale;
    self.inAppBrowserViewController.webView.mediaPlaybackRequiresUserAction = browserOptions.mediaplaybackrequiresuseraction;
    self.inAppBrowserViewController.webView.allowsInlineMediaPlayback = browserOptions.allowinlinemediaplayback;
    if (IsAtLeastiOSVersion(@"6.0")) {
        self.inAppBrowserViewController.webView.keyboardDisplayRequiresUserAction = browserOptions.keyboarddisplayrequiresuseraction;
        self.inAppBrowserViewController.webView.suppressesIncrementalRendering = browserOptions.suppressesincrementalrendering;
    }
    
    if (! browserOptions.hidden) {
        if (self.viewController.modalViewController != self.inAppBrowserViewController) {
            
            [self initOrRefreshViewSizeAndBounds];
            
        }
    }
    [self.inAppBrowserViewController navigateTo:url];
}

- (void)show:(CDVInvokedUrlCommand*)command
{
    if ([self.inAppBrowserViewController isViewLoaded] && self.inAppBrowserViewController.view.window)
        return;
    [self.viewController presentModalViewController:self.inAppBrowserViewController animated:YES];
}

- (void)openInCordovaWebView:(NSURL*)url withOptions:(NSString*)options
{
    if ([self.commandDelegate URLIsWhitelisted:url]) {
        NSURLRequest* request = [NSURLRequest requestWithURL:url];
        [self.webView loadRequest:request];
    } else { // this assumes the InAppBrowser can be excepted from the white-list
        [self openInInAppBrowser:url withOptions:options];
    }
}

- (void)openInSystem:(NSURL*)url
{
    if ([[UIApplication sharedApplication] canOpenURL:url]) {
        [[UIApplication sharedApplication] openURL:url];
    } else { // handle any custom schemes to plugins
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    }
}

// This is a helper method for the inject{Script|Style}{Code|File} API calls, which
// provides a consistent method for injecting JavaScript code into the document.
//
// If a wrapper string is supplied, then the source string will be JSON-encoded (adding
// quotes) and wrapped using string formatting. (The wrapper string should have a single
// '%@' marker).
//
// If no wrapper is supplied, then the source string is executed directly.

- (void)injectDeferredObject:(NSString*)source withWrapper:(NSString*)jsWrapper
{
    if (!_injectedIframeBridge) {
        _injectedIframeBridge = YES;
        // Create an iframe bridge in the new document to communicate with the CDVInAppBrowserViewController
        [self.inAppBrowserViewController.webView stringByEvaluatingJavaScriptFromString:@"(function(d){var e = _cdvIframeBridge = d.createElement('iframe');e.style.display='none';d.body.appendChild(e);})(document)"];
    }
    
    if (jsWrapper != nil) {
        NSString* sourceArrayString = [@[source] JSONString];
        if (sourceArrayString) {
            NSString* sourceString = [sourceArrayString substringWithRange:NSMakeRange(1, [sourceArrayString length] - 2)];
            NSString* jsToInject = [NSString stringWithFormat:jsWrapper, sourceString];
            [self.inAppBrowserViewController.webView stringByEvaluatingJavaScriptFromString:jsToInject];
        }
    } else {
        [self.inAppBrowserViewController.webView stringByEvaluatingJavaScriptFromString:source];
    }
}

- (void)injectScriptCode:(CDVInvokedUrlCommand*)command
{
    NSString* jsWrapper = nil;
    
    if ((command.callbackId != nil) && ![command.callbackId isEqualToString:@"INVALID"]) {
        jsWrapper = [NSString stringWithFormat:@"_cdvIframeBridge.src='gap-iab://%@/'+window.escape(JSON.stringify([eval(%%@)]));", command.callbackId];
    }
    [self injectDeferredObject:[command argumentAtIndex:0] withWrapper:jsWrapper];
}

- (void)injectScriptFile:(CDVInvokedUrlCommand*)command
{
    NSString* jsWrapper;
    
    if ((command.callbackId != nil) && ![command.callbackId isEqualToString:@"INVALID"]) {
        jsWrapper = [NSString stringWithFormat:@"(function(d) { var c = d.createElement('script'); c.src = %%@; c.onload = function() { _cdvIframeBridge.src='gap-iab://%@'; }; d.body.appendChild(c); })(document)", command.callbackId];
    } else {
        jsWrapper = @"(function(d) { var c = d.createElement('script'); c.src = %@; d.body.appendChild(c); })(document)";
    }
    [self injectDeferredObject:[command argumentAtIndex:0] withWrapper:jsWrapper];
}

- (void)injectStyleCode:(CDVInvokedUrlCommand*)command
{
    NSString* jsWrapper;
    
    if ((command.callbackId != nil) && ![command.callbackId isEqualToString:@"INVALID"]) {
        jsWrapper = [NSString stringWithFormat:@"(function(d) { var c = d.createElement('style'); c.innerHTML = %%@; c.onload = function() { _cdvIframeBridge.src='gap-iab://%@'; }; d.body.appendChild(c); })(document)", command.callbackId];
    } else {
        jsWrapper = @"(function(d) { var c = d.createElement('style'); c.innerHTML = %@; d.body.appendChild(c); })(document)";
    }
    [self injectDeferredObject:[command argumentAtIndex:0] withWrapper:jsWrapper];
}

- (void)injectStyleFile:(CDVInvokedUrlCommand*)command
{
    NSString* jsWrapper;
    
    if ((command.callbackId != nil) && ![command.callbackId isEqualToString:@"INVALID"]) {
        jsWrapper = [NSString stringWithFormat:@"(function(d) { var c = d.createElement('link'); c.rel='stylesheet'; c.type='text/css'; c.href = %%@; c.onload = function() { _cdvIframeBridge.src='gap-iab://%@'; }; d.body.appendChild(c); })(document)", command.callbackId];
    } else {
        jsWrapper = @"(function(d) { var c = d.createElement('link'); c.rel='stylesheet', c.type='text/css'; c.href = %@; d.body.appendChild(c); })(document)";
    }
    [self injectDeferredObject:[command argumentAtIndex:0] withWrapper:jsWrapper];
}

/**
 * The iframe bridge provided for the InAppBrowser is capable of executing any oustanding callback belonging
 * to the InAppBrowser plugin. Care has been taken that other callbacks cannot be triggered, and that no
 * other code execution is possible.
 *
 * To trigger the bridge, the iframe (or any other resource) should attempt to load a url of the form:
 *
 * gap-iab://<callbackId>/<arguments>
 *
 * where <callbackId> is the string id of the callback to trigger (something like "InAppBrowser0123456789")
 *
 * If present, the path component of the special gap-iab:// url is expected to be a URL-escaped JSON-encoded
 * value to pass to the callback. [NSURL path] should take care of the URL-unescaping, and a JSON_EXCEPTION
 * is returned if the JSON is invalid.
 */
- (BOOL)webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    NSURL* url = request.URL;
    BOOL isTopLevelNavigation = [request.URL isEqual:[request mainDocumentURL]];
    
    // See if the url uses the 'gap-iab' protocol. If so, the host should be the id of a callback to execute,
    // and the path, if present, should be a JSON-encoded value to pass to the callback.
    if ([[url scheme] isEqualToString:@"gap-iab"]) {
        NSString* scriptCallbackId = [url host];
        CDVPluginResult* pluginResult = nil;
        
        if ([scriptCallbackId hasPrefix:@"InAppBrowser"]) {
            NSString* scriptResult = [url path];
            NSError* __autoreleasing error = nil;
            
            // The message should be a JSON-encoded array of the result of the script which executed.
            if ((scriptResult != nil) && ([scriptResult length] > 1)) {
                scriptResult = [scriptResult substringFromIndex:1];
                NSData* decodedResult = [NSJSONSerialization JSONObjectWithData:[scriptResult dataUsingEncoding:NSUTF8StringEncoding] options:kNilOptions error:&error];
                if ((error == nil) && [decodedResult isKindOfClass:[NSArray class]]) {
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:(NSArray*)decodedResult];
                } else {
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_JSON_EXCEPTION];
                }
            } else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:@[]];
            }
            [self.commandDelegate sendPluginResult:pluginResult callbackId:scriptCallbackId];
            return NO;
        }
    } else if ((self.callbackId != nil) && isTopLevelNavigation) {
        // Send a loadstart event for each top-level navigation (includes redirects).
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:@{@"type":@"loadstart", @"url":[url absoluteString]}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
    
    return YES;
}

- (void)webViewDidStartLoad:(UIWebView*)theWebView
{
    _injectedIframeBridge = NO;
}

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    if (self.callbackId != nil) {
        
        // if you CLOSE the web view before it finishes loading sometimes it throws and error
        if(self.inAppBrowserViewController.currentURL.absoluteString == nil){
            NSLog(@" webViewDidFinishLoad() WARNING: *absoluteString is nil! Did you close the web view before it finished loading?");
            return;
        }
        
        // TODO: It would be more useful to return the URL the page is actually on (e.g. if it's been redirected).
        NSString* url = [self.inAppBrowserViewController.currentURL absoluteString];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:@{@"type":@"loadstop", @"url":url}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void)webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
{
    if (self.callbackId != nil) {
        NSString* url = [self.inAppBrowserViewController.currentURL absoluteString];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                      messageAsDictionary:@{@"type":@"loaderror", @"url":url, @"code": [NSNumber numberWithInt:error.code], @"message": error.localizedDescription}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}



- (void)listSubviewsOfView:(UIView *)view {
    
    // Get the subviews of the view
    NSArray *subviews = [view subviews];
    float viewCount = 0;
    
    // Return if there are no subviews
    if ([subviews count] == 0) return;
    
    for (UIView *subview in subviews) {
        
        viewCount ++;
        
        NSLog(@"SubView [#%f] {%@}", viewCount, [[subview class]description]);
        
        // List the subviews of subview
        [self listSubviewsOfView:subview];
    }
}

- (void)browserExit
{
    /*DEBUG*/ //NSLog(@"--> CDVInAppBrowser.browserExit()...");
    if (self.callbackId != nil) {
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:@{@"type":@"exit"}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
    // Don't recycle the ViewController since it may be consuming a lot of memory.
    // Also - this is required for the PDF/User-Agent bug work-around.
    self.inAppBrowserViewController = nil;
    
}

@end

#pragma mark CDVInAppBrowserViewController

@implementation CDVInAppBrowserViewController

@synthesize currentURL;

- (id)initWithUserAgent:(NSString*)userAgent prevUserAgent:(NSString*)prevUserAgent
{
    self = [super init];
    
    if (self != nil) {
        _userAgent = userAgent;
        _prevUserAgent = prevUserAgent;
        _webViewDelegate = [[CDVWebViewDelegate alloc] initWithDelegate:self];
        
        [self createViews];
    }
    
    return self;
}

- (void)toggleFullScreen{
    /*DEBUG*/ //NSLog(@"toggleFullScreen().. vc.view.frame.size.width[%f]", vc.view.frame.size.width);
    
    if(IN_FULLSCREEN_MODE == YES){
        IN_FULLSCREEN_MODE = NO;
    }else{
        IN_FULLSCREEN_MODE = YES;
    }
    [iabvc initOrRefreshFullscreenButton];
    
    // OLD close actions
    if ([iab respondsToSelector:@selector(initOrRefreshViewSizeAndBounds)]) {
        [iab initOrRefreshViewSizeAndBounds];
    }
    
}



- (void)createViews
{
    // We create the views in code for primarily for ease of upgrades and not requiring an external .xib to be included
    
    CGRect webViewBounds = self.view.bounds;
    
    webViewBounds.size.height -= FOOTER_HEIGHT;
    
    self.webView.scalesPageToFit = YES;
    self.webView.contentMode = UIViewAutoresizingFlexibleWidth;
    
    self.webView = [[UIWebView alloc] initWithFrame:webViewBounds];
    
    [self.view addSubview:self.webView];
    [self.view sendSubviewToBack:self.webView];
    
    self.webView.delegate = _webViewDelegate;
    self.webView.backgroundColor = [UIColor clearColor];
    
    self.webView.clearsContextBeforeDrawing = YES;
    self.webView.clipsToBounds = YES;
    self.webView.contentMode = UIViewContentModeScaleToFill;
    self.webView.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.webView.multipleTouchEnabled = YES;
    // set webView to transparent so the transition animation is actually covering up the app
    self.webView.opaque = NO;
    self.webView.userInteractionEnabled = YES;
    
    self.spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    self.spinner.alpha = 1.000;
    self.spinner.autoresizesSubviews = YES;
    self.spinner.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleTopMargin;
    self.spinner.clearsContextBeforeDrawing = NO;
    self.spinner.clipsToBounds = NO;
    self.spinner.contentMode = UIViewContentModeScaleToFill;
    self.spinner.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.spinner.frame = CGRectMake(454.0, 231.0, 20.0, 20.0);
    self.spinner.hidden = YES;
    self.spinner.hidesWhenStopped = YES;
    self.spinner.multipleTouchEnabled = NO;
    self.spinner.opaque = NO;
    self.spinner.userInteractionEnabled = NO;
    [self.spinner stopAnimating];
    
    // closeButton
    self.closeButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(close)];
    self.closeButton.enabled = YES;
    
    UIBarButtonItem* flexibleSpaceButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:nil];
    
    UIBarButtonItem* fixedSpaceButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFixedSpace target:nil action:nil];
    fixedSpaceButton.width = 20;
    
    // fullScreenButton
    self.fullScreenButton = [[UIBarButtonItem alloc] init];
    self.fullScreenButton.enabled = YES;
    
    
    self.toolbar = [[UIToolbar alloc] initWithFrame:CGRectMake(0.0, (self.view.bounds.size.height - TOOLBAR_HEIGHT), self.view.bounds.size.width, TOOLBAR_HEIGHT)];
    self.toolbar.alpha = 1.000;
    self.toolbar.autoresizesSubviews = YES;
    self.toolbar.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
    self.toolbar.barStyle = UIBarStyleBlackOpaque;
    self.toolbar.clearsContextBeforeDrawing = NO;
    self.toolbar.clipsToBounds = NO;
    self.toolbar.contentMode = UIViewContentModeScaleToFill;
    self.toolbar.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.toolbar.hidden = NO;
    self.toolbar.multipleTouchEnabled = NO;
    self.toolbar.opaque = NO;
    self.toolbar.userInteractionEnabled = YES;
    
    CGFloat labelInset = 5.0;
    self.addressLabel = [[UILabel alloc] initWithFrame:CGRectMake(labelInset, (self.view.bounds.size.height - FOOTER_HEIGHT), self.view.bounds.size.width - labelInset, LOCATIONBAR_HEIGHT)];
    self.addressLabel.adjustsFontSizeToFitWidth = NO;
    self.addressLabel.alpha = 1.000;
    self.addressLabel.autoresizesSubviews = YES;
    self.addressLabel.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleTopMargin;
    self.addressLabel.backgroundColor = [UIColor clearColor];
    self.addressLabel.baselineAdjustment = UIBaselineAdjustmentAlignCenters;
    self.addressLabel.clearsContextBeforeDrawing = YES;
    self.addressLabel.clipsToBounds = YES;
    self.addressLabel.contentMode = UIViewContentModeScaleToFill;
    self.addressLabel.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.addressLabel.enabled = YES;
    self.addressLabel.hidden = NO;
    self.addressLabel.lineBreakMode = UILineBreakModeTailTruncation;
    self.addressLabel.minimumFontSize = 10.000;
    self.addressLabel.multipleTouchEnabled = NO;
    self.addressLabel.numberOfLines = 1;
    self.addressLabel.opaque = NO;
    self.addressLabel.shadowOffset = CGSizeMake(0.0, -1.0);
    self.addressLabel.text = @"Loading...";
    self.addressLabel.textAlignment = UITextAlignmentLeft;
    self.addressLabel.textColor = [UIColor colorWithWhite:1.000 alpha:1.000];
    self.addressLabel.userInteractionEnabled = NO;
    
    NSString* frontArrowString = @"►"; // create arrow from Unicode char
    self.forwardButton = [[UIBarButtonItem alloc] initWithTitle:frontArrowString style:UIBarButtonItemStylePlain target:self action:@selector(goForward:)];
    self.forwardButton.enabled = YES;
    self.forwardButton.imageInsets = UIEdgeInsetsZero;
    
    NSString* backArrowString = @"◄"; // create arrow from Unicode char
    self.backButton = [[UIBarButtonItem alloc] initWithTitle:backArrowString style:UIBarButtonItemStylePlain target:self action:@selector(goBack:)];
    self.backButton.enabled = YES;
    self.backButton.imageInsets = UIEdgeInsetsZero;
    
    if((!WINDOWED_MODE_ENABLED) || (!FULLSCREEN_BUTTON_ENABLED)){
        [self.toolbar setItems:@[self.closeButton, flexibleSpaceButton, self.backButton, fixedSpaceButton, self.forwardButton]];
    }else{
        [self.toolbar setItems:@[self.closeButton, flexibleSpaceButton, self.backButton, fixedSpaceButton, self.forwardButton, self.fullScreenButton]];
    }
    
    
    self.view.backgroundColor = [UIColor grayColor];
    self.view.opaque = YES;
    
    [self.view addSubview:self.toolbar];
    [self.view addSubview:self.addressLabel];
    [self.view addSubview:self.spinner];
    
}

// added buttonBGColor parameter
- (void)configureCloseButton:(NSString*)title buttonBGColor:(NSString*) buttonBGColor
{
    // the advantage of using UIBarButtonSystemItemDone is the system will localize it for you automatically
    // but, if you want to set this yourself, knock yourself out (we can't set the title for a system Done button, so we have to create a new one)
    self.closeButton = nil;
    if(title != nil){
        self.closeButton = [[UIBarButtonItem alloc] initWithTitle:title style:UIBarButtonItemStyleBordered target:self action:@selector(close)];
    }else{
        self.closeButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(close)];
    }
    
    self.closeButton.enabled = YES;
    
    // button coloring | abstract this out into a standalone method?
    NSString *stringColor = buttonBGColor;
    NSUInteger red, green, blue;
    sscanf([stringColor UTF8String], "#%02X%02X%02X", &red, &green, &blue);
    UIColor *buttonbg = [UIColor colorWithRed:red/255.0 green:green/255.0 blue:blue/255.0 alpha:1];
    [self.closeButton setTintColor:buttonbg];
    
    NSMutableArray* items = [self.toolbar.items mutableCopy];
    [items replaceObjectAtIndex:0 withObject:self.closeButton];
    [self.toolbar setItems:items];
}


- (void)initOrRefreshFullscreenButton
{
    if(!FULLSCREEN_BUTTON_ENABLED) return;
    
    UIButton *fsButton = [[UIButton alloc] init];
    [fsButton addTarget:self action:@selector(toggleFullScreen)
       forControlEvents:UIControlEventTouchUpInside];
    CGRect fsButtonFrame = CGRectMake(0, 0, 45, 45);
    
    UIImage *fullscreenButtonImg;
    
    if(!IN_FULLSCREEN_MODE){
        fullscreenButtonImg = [UIImage imageNamed:@"CDVInAppBrowser_fs.png"];
    }else{
        fullscreenButtonImg = [UIImage imageNamed:@"CDVInAppBrowser_fs_exit.png"];
    }
    
    if((IN_ROTATED_MODE) && (FULLSCREEN_WHEN_ROTATED)){
        fsButtonFrame = CGRectMake(0,0,0,0);
    }
    
    [fsButton setImage:fullscreenButtonImg forState:UIControlStateNormal];
    
    [fsButton setFrame:fsButtonFrame];
    
    self.fullScreenButton = [[UIBarButtonItem alloc]
                             initWithCustomView:fsButton];
    
    self.fullScreenButton.enabled = YES;
    
    [self.fullScreenButton setTintColor:[UIColor clearColor]];
    
    NSMutableArray* items = [self.toolbar.items mutableCopy];
    [items replaceObjectAtIndex:items.count-1 withObject:self.fullScreenButton];
    [self.toolbar setItems:items];
}

- (void)showLocationBar:(BOOL)show
{
    CGRect locationbarFrame = self.addressLabel.frame;
    
    BOOL toolbarVisible = !self.toolbar.hidden;
    
    // prevent double show/hide
    if (show == !(self.addressLabel.hidden)) {
        return;
    }
    
    if (show) {
        self.addressLabel.hidden = NO;
        
        if (toolbarVisible) {
            // toolBar at the bottom, leave as is
            // put locationBar on top of the toolBar
            
            CGRect webViewBounds = self.view.bounds;
            webViewBounds.size.height -= FOOTER_HEIGHT;
            self.webView.frame = webViewBounds;
            
            locationbarFrame.origin.y = webViewBounds.size.height;
            self.addressLabel.frame = locationbarFrame;
        } else {
            // no toolBar, so put locationBar at the bottom
            
            CGRect webViewBounds = self.view.bounds;
            webViewBounds.size.height -= LOCATIONBAR_HEIGHT;
            self.webView.frame = webViewBounds;
            
            locationbarFrame.origin.y = webViewBounds.size.height;
            self.addressLabel.frame = locationbarFrame;
        }
    } else {
        self.addressLabel.hidden = YES;
        
        if (toolbarVisible) {
            // locationBar is on top of toolBar, hide locationBar
            
            // webView take up whole height less toolBar height
            CGRect webViewBounds = self.view.bounds;
            webViewBounds.size.height -= TOOLBAR_HEIGHT;
            self.webView.frame = webViewBounds;
        } else {
            // no toolBar, expand webView to screen dimensions
            
            CGRect webViewBounds = self.view.bounds;
            self.webView.frame = webViewBounds;
        }
    }
}

- (void)showToolBar:(BOOL)show
{
    CGRect toolbarFrame = self.toolbar.frame;
    CGRect locationbarFrame = self.addressLabel.frame;
    
    BOOL locationbarVisible = !self.addressLabel.hidden;
    
    // prevent double show/hide
    if (show == !(self.toolbar.hidden)) {
        return;
    }
    
    if (show) {
        self.toolbar.hidden = NO;
        
        if (locationbarVisible) {
            // locationBar at the bottom, move locationBar up
            // put toolBar at the bottom
            
            CGRect webViewBounds = self.view.bounds;
            webViewBounds.size.height -= FOOTER_HEIGHT;
            self.webView.frame = webViewBounds;
            
            locationbarFrame.origin.y = webViewBounds.size.height;
            self.addressLabel.frame = locationbarFrame;
            
            toolbarFrame.origin.y = (webViewBounds.size.height + LOCATIONBAR_HEIGHT);
            self.toolbar.frame = toolbarFrame;
        } else {
            // no locationBar, so put toolBar at the bottom
            
            CGRect webViewBounds = self.view.bounds;
            webViewBounds.size.height -= TOOLBAR_HEIGHT;
            self.webView.frame = webViewBounds;
            
            toolbarFrame.origin.y = webViewBounds.size.height;
            self.toolbar.frame = toolbarFrame;
        }
    } else {
        self.toolbar.hidden = YES;
        
        if (locationbarVisible) {
            // locationBar is on top of toolBar, hide toolBar
            // put locationBar at the bottom
            
            // webView take up whole height less locationBar height
            CGRect webViewBounds = self.view.bounds;
            webViewBounds.size.height -= LOCATIONBAR_HEIGHT;
            self.webView.frame = webViewBounds;
            
            // move locationBar down
            locationbarFrame.origin.y = webViewBounds.size.height;
            self.addressLabel.frame = locationbarFrame;
        } else {
            // no locationBar, expand webView to screen dimensions
            
            CGRect webViewBounds = self.view.bounds;
            self.webView.frame = webViewBounds;
        }
    }
}

//********** ORIENTATION CHANGED **********
- (void)orientationChanged:(NSNotification *)note
{
	// if this has been overridden then ignore all rotation events
    if((!FULLSCREEN_WHEN_ROTATED) || (!WINDOWED_MODE_ENABLED)) return;
    
    if(IN_ROTATED_MODE == NO){
        IN_ROTATED_MODE = YES;
        /*DEBUG*/ //NSLog(@"orientationChanged: changed rotation ...");
    }else{
        IN_ROTATED_MODE = NO;
        /*DEBUG*/ //NSLog(@"orientationChanged: changed to default rotation ...");
    }
    
    if ([iab respondsToSelector:@selector(initOrRefreshViewSizeAndBounds)]){
        [iab initOrRefreshViewSizeAndBounds];
    }
}

- (void)viewDidLoad
{
    
    /*DEBUG*/ //NSLog(@"--> CDVInAppBrowserViewController.viewDidLoad()");
    IN_ROTATED_MODE = NO;
    IN_FULLSCREEN_MODE = NO;
    HAS_ANIMATED = NO;
    
    [super viewDidLoad];
    
    // detect rotation for resizing logic
    if (self != nil) {
        UIDevice *device = [UIDevice currentDevice];					//Get the device object
        [device beginGeneratingDeviceOrientationNotifications];			//Tell it to start monitoring the accelerometer for orientation
        NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];	//Get the notification centre for the app
        [nc addObserver:self                                               //Add yourself as an observer
               selector:@selector(orientationChanged:)
                   name:UIDeviceOrientationDidChangeNotification
                 object:device];
        
    }
}

- (void)viewDidUnload
{
    /*DEBUG*/ //NSLog(@"............... CDVInAppBrowserViewController.viewDidUnload()");
    [self.webView loadHTMLString:nil baseURL:nil];
    [CDVUserAgentUtil releaseLock:&_userAgentLockToken];
    
    UIDevice *device = [UIDevice currentDevice];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceOrientationDidChangeNotification object:device];
    
    [super viewDidUnload];
}





- (void)close
{
    NSLog(@"--> CDVInAppBrowserViewController.close()...");
    
    [CDVUserAgentUtil releaseLock:&_userAgentLockToken];
    
    // OLD close actions
    if ([self respondsToSelector:@selector(presentingViewController)]) {
        [[self presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[self parentViewController] dismissModalViewControllerAnimated:YES];
    }
    
    self.currentURL = nil;
    
    if ((self.navigationDelegate != nil) && [self.navigationDelegate respondsToSelector:@selector(browserExit)]) {
        [self.navigationDelegate browserExit];
    }
    
}

- (void)navigateTo:(NSURL*)url
{
    NSURLRequest* request = [NSURLRequest requestWithURL:url];
    
    if (_userAgentLockToken != 0) {
        [self.webView loadRequest:request];
    } else {
        [CDVUserAgentUtil acquireLock:^(NSInteger lockToken) {
            _userAgentLockToken = lockToken;
            [CDVUserAgentUtil setUserAgent:_userAgent lockToken:lockToken];
            [self.webView loadRequest:request];
        }];
    }
}

- (void)goBack:(id)sender
{
    [self.webView goBack];
}

- (void)goForward:(id)sender
{
    [self.webView goForward];
}

#pragma mark UIWebViewDelegate

- (void)webViewDidStartLoad:(UIWebView*)theWebView
{
    // loading url, start spinner, update back/forward
    
    self.addressLabel.text = @"Loading...";
    self.backButton.enabled = theWebView.canGoBack;
    self.forwardButton.enabled = theWebView.canGoForward;
    
    [self.spinner startAnimating];
    
    return [self.navigationDelegate webViewDidStartLoad:theWebView];
}

- (BOOL)webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    BOOL isTopLevelNavigation = [request.URL isEqual:[request mainDocumentURL]];
    
    if (isTopLevelNavigation) {
        self.currentURL = request.URL;
    }
    return [self.navigationDelegate webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    // update url, stop spinner, update back/forward
    
    self.addressLabel.text = [self.currentURL absoluteString];
    self.backButton.enabled = theWebView.canGoBack;
    self.forwardButton.enabled = theWebView.canGoForward;
    
    [self.spinner stopAnimating];
    
    // Work around a bug where the first time a PDF is opened, all UIWebViews
    // reload their User-Agent from NSUserDefaults.
    // This work-around makes the following assumptions:
    // 1. The app has only a single Cordova Webview. If not, then the app should
    //    take it upon themselves to load a PDF in the background as a part of
    //    their start-up flow.
    // 2. That the PDF does not require any additional network requests. We change
    //    the user-agent here back to that of the CDVViewController, so requests
    //    from it must pass through its white-list. This *does* break PDFs that
    //    contain links to other remote PDF/websites.
    // More info at https://issues.apache.org/jira/browse/CB-2225
    BOOL isPDF = [@"true" isEqualToString :[theWebView stringByEvaluatingJavaScriptFromString:@"document.body==null"]];
    if (isPDF) {
        [CDVUserAgentUtil setUserAgent:_prevUserAgent lockToken:_userAgentLockToken];
    }
    
    [self.navigationDelegate webViewDidFinishLoad:theWebView];
}

- (void)webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
{
    // log fail message, stop spinner, update back/forward
    NSLog(@"webView:didFailLoadWithError - %@", [error localizedDescription]);
    
    self.backButton.enabled = theWebView.canGoBack;
    self.forwardButton.enabled = theWebView.canGoForward;
    [self.spinner stopAnimating];
    
    self.addressLabel.text = @"Load Error";
    
    [self.navigationDelegate webView:theWebView didFailLoadWithError:error];
}

#pragma mark CDVScreenOrientationDelegate

- (BOOL)shouldAutorotate
{
    if ((self.orientationDelegate != nil) && [self.orientationDelegate respondsToSelector:@selector(shouldAutorotate)]) {
        return [self.orientationDelegate shouldAutorotate];
    }
    return YES;
}

- (NSUInteger)supportedInterfaceOrientations
{
    if ((self.orientationDelegate != nil) && [self.orientationDelegate respondsToSelector:@selector(supportedInterfaceOrientations)]) {
        return [self.orientationDelegate supportedInterfaceOrientations];
    }
    
    return 1 << UIInterfaceOrientationPortrait;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if ((self.orientationDelegate != nil) && [self.orientationDelegate respondsToSelector:@selector(shouldAutorotateToInterfaceOrientation:)]) {
        return [self.orientationDelegate shouldAutorotateToInterfaceOrientation:interfaceOrientation];
    }
    
    return YES;
}

@end

@implementation CDVInAppBrowserOptions

- (id)init
{
    if (self = [super init]) {
        // default values
        
        self.location = YES;
        self.toolbar = YES;
        self.enableviewportscale = NO;
        self.mediaplaybackrequiresuseraction = NO;
        self.allowinlinemediaplayback = NO;
        self.keyboarddisplayrequiresuseraction = YES;
        self.suppressesincrementalrendering = NO;
        self.hidden = NO;
        
        self.closebuttoncaption = CLOSE_BUTTON_LABEL;
        self.fullscreenwhenrotated = YES;
        self.fullscreenbuttonenabled = YES;
        self.vw = [iab currentScreenBoundsDependOnOrientation].size.width;
        self.vh = [iab currentScreenBoundsDependOnOrientation].size.height;
        self.vx = iabvc.view.frame.origin.x;
        self.vy = 0;
        self.buttoncolorbg = BUTTON_BACKGROUND_COLOR;
    }
    
    return self;
}

+ (CDVInAppBrowserOptions*)parseOptions:(NSString*)options
{
    CDVInAppBrowserOptions* obj = [[CDVInAppBrowserOptions alloc] init];
    
    // NOTE: this parsing does not handle quotes within values
    NSArray* pairs = [options componentsSeparatedByString:@","];
    
    // parse keys and values, set the properties
    for (NSString* pair in pairs) {
        NSArray* keyvalue = [pair componentsSeparatedByString:@"="];
        
        if ([keyvalue count] == 2) {
            NSString* key = [[keyvalue objectAtIndex:0] lowercaseString];
            NSString* value = [keyvalue objectAtIndex:1];
            NSString* value_lc = [value lowercaseString];
            
            BOOL isBoolean = [value_lc isEqualToString:@"yes"] || [value_lc isEqualToString:@"no"];
            NSNumberFormatter* numberFormatter = [[NSNumberFormatter alloc] init];
            [numberFormatter setAllowsFloats:YES];
            BOOL isNumber = [numberFormatter numberFromString:value_lc] != nil;
            
            // set the property according to the key name
            if ([obj respondsToSelector:NSSelectorFromString(key)]) {
                //NSLog(@"....parsing browserOption[%@] ...", key);
                if (isNumber) {
                    [obj setValue:[numberFormatter numberFromString:value_lc] forKey:key];
                } else if (isBoolean) {
                    [obj setValue:[NSNumber numberWithBool:[value_lc isEqualToString:@"yes"]] forKey:key];
                } else { // string
                    [obj setValue:value forKey:key];
                }
            }
        }
    }
    
    return obj;
}

@end
