import {ExtensionMessage} from './config/extension-message';

//
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message) {
    case ExtensionMessage.OPEN_OPTIONS_PAGE:
      chrome.runtime.openOptionsPage();
      sendResponse('');
      break;
  }
});
