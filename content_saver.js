document.addEventListener('myCustomEvent', function(evt) {  
  var add_index = evt.detail.index;
  //alert(add_index);
  chrome.runtime.sendMessage({shaon_message:'addclosetab',popup_tab:add_index},function(r){/*alert(r.shaon_response);*/chrome.tabs.remove(add_index);});
});

document.addEventListener('myCustomEvent2', function(evt) {  
  var add_index = evt.detail.index;
  alert(add_index);
  chrome.runtime.sendMessage({shaon_message:'addclosetab',popup_tab:add_index},function(r){/*alert(r.shaon_response);*/});
});