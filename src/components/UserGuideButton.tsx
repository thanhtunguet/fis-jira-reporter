import Button from 'antd/es/button';
import {openOptionsPage} from 'src/helpers/open-options-page';
import React from 'react';

export function UserGuideButton() {
  return (
    <Button type="default" role="link" onClick={openOptionsPage}>
      User guide
    </Button>
  );
}
