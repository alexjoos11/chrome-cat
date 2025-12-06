chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_TAB") {
    chrome.tabs.create({ url: msg.url });
  }
});
