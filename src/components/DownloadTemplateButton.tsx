import Button from 'antd/es/button';
import {DownloadOutlined} from '@ant-design/icons';

export const DownloadTemplateButton = () => {
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
