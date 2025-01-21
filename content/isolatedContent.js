(async () => {
  window.addEventListener("PassToBackground", function (evt) {
    console.log('here');
    chrome.runtime.sendMessage(evt.detail);
  }, false);
})()