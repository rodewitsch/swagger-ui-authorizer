(async () => {
  window.addEventListener("PassToBackground", function (evt) {
    chrome.runtime.sendMessage(evt.detail);
  }, false);
})()