import {JIRA_HOST} from 'src/config/consts';

export function openJira() {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    // Get the current tab
    var currentTab = tabs[0];

    // Update the URL of the current tab
    chrome.tabs.update(currentTab.id, {url: JIRA_HOST});
  });
}
