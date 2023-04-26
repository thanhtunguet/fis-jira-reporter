import {Repository} from 'react3l';
import {JIRA_HOST} from 'src/config/consts';

Repository.requestInterceptor = async function (config) {
  const cookie = await chrome.cookies.get({
    url: JIRA_HOST,
    name: 'JSESSIONID',
  });
  config.headers.cookie = `JSESSIONID=${cookie.value}`;
  return config;
};
