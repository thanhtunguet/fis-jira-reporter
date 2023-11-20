import type {ModalProps} from 'reactstrap';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import type {FC, PropsWithChildren} from 'react';
import React from 'react';

const ModalTemplate: FC<PropsWithChildren<ModalTemplateProps>> = (
  props: PropsWithChildren<ModalTemplateProps>,
): JSX.Element => {
  const {
    children,
    isLoading,
    onOk,
    okText,
    onCancel,
    cancelText,
    title,
    ...restProps //
  } = props;

  return (
    <Modal {...restProps} size="xl" unmountOnClose={true} fullscreen={true}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button
          onClick={onOk}
          className="aui-button aui-button-primary aui-style inline-flex align-items-center">
          {isLoading && (
            <Spinner
              className="jira-primary-spinner"
              type="border"
              color="light"
            />
          )}
          <span className="mx-2">{okText}</span>
        </Button>
        <Button
          color="secondary"
          onClick={onCancel}
          className="aui-button aui-button-secondary aui-style">
          {cancelText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export interface ModalTemplateProps extends ModalProps {
  okText?: string;

  onOk?(): void | Promise<void>;

  cancelText?: string;

  onCancel?(): void | Promise<void>;

  isLoading?: boolean;

  title: string;
}

ModalTemplate.defaultProps = {
  okText: 'OK',
  cancelText: 'Cancel',
};

export default ModalTemplate;
