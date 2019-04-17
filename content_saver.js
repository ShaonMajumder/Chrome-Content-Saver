document.body.style.border = "5px solid red";

function openPage() {
  chrome.tabs.create({
    url: "https://google.com"
  });
}

chrome.browserAction.onClicked.addListener(openPage);

/*
document.addEventListener("click", function(e) {
	var gettingCurrent = chrome.tabs.getCurrent();
	console.log(gettingCurrent);

  if (!e.target.classList.contains("page-choice")) {
    return;
  }

  var chosenPage = "https://" + e.target.textContent;
  chrome.tabs.create({
    url: chosenPage
  });

});*/