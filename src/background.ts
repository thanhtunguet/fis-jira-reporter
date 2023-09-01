chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  }
  sendResponse('');
});
