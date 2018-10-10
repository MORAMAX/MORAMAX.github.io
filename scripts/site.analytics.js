(function($) {
    var ACCOUNT_ID = "UA-17378827-1";
	$.GA={};
	$.GA.intallationStatus="not started";
	$.GA.pageTracker=null;
	$.GA.eventQueue=[];

	function installGA() {
		var host=(("https:"==document.location.protocol)?"https://ssl.":"http://www.");
		var src=host+"google-analytics.com/ga.js";

		log("downloading GA: " + src);
		
		$.GA.intallationStatus="downloading";

		//load GA file
		$.ajax({
			type: "GET",
			url: src,
			success: function() {
				log("GA downloaded, setting up now");
				$.GA.intallationStatus="installed";

				$.GA.pageTracker=_gat._getTracker(ACCOUNT_ID); /*this part is the same as GA's standard installation*/

				//var strUsername = (jQuery.cookie("googleusername") || "not-logged-in");
				//var strCompany = (jQuery.cookie("googlecompany") || "not-logged-in");

				//log("tracking user type: " + strUsername);
				//log("tracking user company: " + strCompany);
				
				//$.GA.pageTracker._setCustomVar(1,"user-type",strUsername,1); /*http://code.google.com/apis/analytics/docs/tracking/gaTrackingCustomVariables.html#visitorLevel*/
				//$.GA.pageTracker._setCustomVar(2, "user-company", strCompany, 1);

				$.GA.pageTracker._trackPageview(); /*pageview after custom var (i think that's what they say in Recommended Practices)*/

				log("pushing out queued events");
				pushOutQueuedEvents();
			},
			error: function() {
				//the ga.js file wasn't loaded successfully:
				throw "Unable to load ga.js; _gat has not been defined, pageTracker is also undefined - I bet you're using adblock eh? kudos to you :)";
			},
			dataType: "script",
			cache: true
		});
	}
	function pushOutQueuedEvents() {
		log("queued events:");
		for(var item,i=0;item=$.GA.eventQueue[i];i++) {
			log("\tEvent: "+item[0]+", "+item[1]+", "+item[2]);
			$.GA.pageTracker._trackEvent(item[0],item[1],item[2]);
		}
	}
	function log(msg) {
		if(typeof (console)!="undefined"&&console.debug) console.debug(msg);
	}
	/*
	Wrapper for _trackEvent ( http://code.google.com/apis/analytics/docs/gaJS/gaJSApiEventTracking.html )
	suggested usage pattern:
	$("a.something").click(function(){
	$.GA.trackEvent(category,action,opt_label,opt_value)
	});
	
	*/
    
	$.GA.trackEvent=function(category,action,opt_label) {

		/*GA download is happening asynchronously, while it's downloading, events would go unrecorded,
		so, we can push events into an array and then once GA is downloaded - we can push them out.
		*/
		log("\tEvent: "+category+", "+action+", "+opt_label);
		if($.GA.intallationStatus!="installed"||!$.GA.pageTracker) {
			log("recieved event but GA is not yet installed, queuing the event for later");
			$.GA.eventQueue.push([category,action,opt_label]);
		}
		else {
			log("recieved event, sending to GA");
			window.setTimeout(
				function() {
					$.GA.pageTracker._trackEvent(category,action,opt_label)
				},
				100
			);
		}
	}

	$(document).ready(function() {
		log("Installing GA");
		installGA();
	});

})(jQuery);