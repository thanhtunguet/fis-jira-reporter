import Button from 'antd/es/button';
import {DownloadOutlined} from '@ant-design/icons';

export const DownloadTemplateButton = () => {
  return (
    <Button
      className="my-2 d-inline-flex justify-content-center align-items-center"
      type="link"
      icon={<DownloadOutlined />}
      onClick={() => {
        document.getElementById('excel-template').click();
      }}>
      Download template
    </Button>
  );
};
