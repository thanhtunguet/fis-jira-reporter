import Button from 'antd/es/button';
import {DownloadOutlined} from '@ant-design/icons';
import type {FC} from 'react';
import {useTranslation} from 'react-i18next';

const DownloadTemplateButton: FC = (): JSX.Element => {
  const [translate] = useTranslation();

  return (
    <Button
      className="my-2 d-inline-flex justify-content-center align-items-center"
      icon={<DownloadOutlined />}
      onClick={() => {
        window.open(chrome.runtime.getURL('assets/jira.excel.template.xlsx'));
      }}>
      {translate('general.downloadTemplate')}
    </Button>
  );
};

export default DownloadTemplateButton;
