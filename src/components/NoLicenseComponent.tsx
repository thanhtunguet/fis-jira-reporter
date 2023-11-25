import type {FC} from 'react';
import React from 'react';
import Modal from 'antd/lib/modal';

const NoLicenseComponent: FC = (): JSX.Element => {
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  return (
    <Modal
      open={isVisible}
      title="Invalid license"
      closable={false}
      closeIcon={null}
      onOk={() => {
        window.location.href = 'chrome://extensions';
      }}
      onCancel={() => {
        setIsVisible(false);
      }}>
      <div className="d-flex flex-column justify-content-center align-items-start">
        <p>You don't have a valid license to use this extension.</p>
        <p>
          Please contact administrator for your license or remove the extension
          from your browser!
        </p>
      </div>
    </Modal>
  );
};

export default NoLicenseComponent;
