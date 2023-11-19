import React from 'react';
import {Modal, ModalBody, ModalHeader} from 'reactstrap';

export function NoLicenseComponent() {
  return (
    <Modal isOpen={true}>
      <ModalHeader>Invalid License</ModalHeader>
      <ModalBody>
        <div>
          <p>You don't have a valid license to use this extension.</p>
          <p>
            Please purchase your license or remove the extension from your
            browser!
          </p>

          <div className="d-flex justify-content-center">
            <img
              className="mt-4"
              src={chrome.runtime.getURL('assets/thanhtunguet-qr-jira.png')}
              alt="qr-jira"
              width={400}
            />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
