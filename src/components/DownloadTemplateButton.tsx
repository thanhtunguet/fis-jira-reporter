import Button from 'antd/es/button';
import {DownloadOutlined} from '@ant-design/icons';
import type {FC, ReactNode} from 'react';

const DownloadTemplateButton: FC = (): JSX.Element => {
  return (
    <Button
      className="my-2 d-inline-flex justify-content-center align-items-center"
      type="link"
      icon={<DownloadOutlined />}
      onClick={() => {
        window.open(chrome.runtime.getURL('assets/jira.excel.template.xlsx'));
      }}>
      Excel
    </Button>
  );
};

export default DownloadTemplateButton;
