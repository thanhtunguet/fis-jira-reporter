import type {ModalProps} from 'reactstrap';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import type {PropsWithChildren} from 'react';
import React from 'react';

export function ModalTemplate(props: PropsWithChildren<ModalTemplateProps>) {
  const {children, loading, onOk, onCancel, ...restProps} = props;

  return (
    <Modal {...restProps} size="xl" unmountOnClose={true} fullscreen={true}>
      <ModalHeader>Create tasks</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button
          onClick={onOk}
          className="aui-button aui-button-primary aui-style inline-flex align-items-center">
          {loading && (
            <Spinner
              className="jira-primary-spinner"
              type="border"
              color="light"
            />
          )}
          <span className="mx-2">OK</span>
        </Button>
        <Button
          color="secondary"
          onClick={onCancel}
          className="aui-button aui-button-secondary aui-style">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export interface ModalTemplateProps extends ModalProps {
  onOk?(): void | Promise<void>;

  onCancel?(): void | Promise<void>;

  loading?: boolean;
}
