chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var tabid = sender.tab.id;
    var custom_message = message.shaon_message;
    
    if(custom_message=='addclosetab'){
        var popup_id = message.popup_tab;
        //alert("Received popupid:"+popup_id);
        //alert("Received Senderid:"+tabid);
        //sendResponse({shaon_response:tabid}
        chrome.tabs.remove(tabid); // remove popup tab
        //chrome.tabs.remove(tabaddid);//-1 tab or before tab, as it was placed beside the parent tab
    }else if(custom_message=='closetab'){
    	chrome.tabs.remove(tabid);
    	//sendResponse({shaon_response:'my response'})
    }else if(custom_message=='settingstab'){
    	var url = message.urltab;
    	chrome.tabs.remove(tabid);
    	chrome.tabs.create({url: url});
    	//sendResponse({shaon_response:'my response'})
    }
});
/*
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    var tabid = sender.tab.id;
    var custom_message = message.shaon_message;

    if(custom_message=='addclosetab'){
        tabaddid = message.popup_tab;
        alert("Received "+tabaddid);
        //chrome.tabs.remove(tabaddid);
        //chrome.tabs.remove(tabid);
    }else if(custom_message=='closetab'){
        chrome.tabs.remove(tabid);
        //sendResponse({shaon_response:'my response'})
    }else if(custom_message=='settingstab'){
        var url = message.urltab;
        chrome.tabs.remove(tabid);
        chrome.tabs.create({url: url});
        //sendResponse({shaon_response:'my response'})
    }
});
*/
/*
get url from id
chrome.tabs.get(tab_id, function(tab){
    url = tab.url;
});

*/