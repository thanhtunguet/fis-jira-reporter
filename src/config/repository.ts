import type {AxiosRequestConfig} from 'axios';
import {Repository} from 'react3l';
import {JIRA_HOST} from 'src/config/consts';

Repository.requestInterceptor = async function (
  config: AxiosRequestConfig,
): Promise<AxiosRequestConfig> {
  // Only load cookies if outside of Jira site
  if (chrome.cookies) {
    const cookie = await chrome.cookies.get({
      url: JIRA_HOST,
      name: 'JSESSIONID',
    });
    config.headers.cookie = `JSESSIONID=${cookie.value}`;
  }

  return config;
};
