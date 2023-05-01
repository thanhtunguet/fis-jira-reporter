import {ExtensionMessage} from 'src/config/extension-message';

export function openOptionsPage() {
  chrome.runtime.sendMessage(ExtensionMessage.OPEN_OPTIONS_PAGE);
}
