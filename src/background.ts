chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  }
  sendResponse('');
});
