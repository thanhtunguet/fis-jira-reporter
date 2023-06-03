import Button from 'antd/es/button';
import React from 'react';

export function UserGuideButton() {
  return (
    <Button
      type="default"
      role="link"
      onClick={() => {
        chrome.runtime.sendMessage('openOptionsPage');
      }}>
      User guide
    </Button>
  );
}
