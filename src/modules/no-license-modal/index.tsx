import type {ModalTemplateProps} from 'src/components/ModalTemplate';
import {ModalTemplate} from 'src/components/ModalTemplate';
import Spin from 'antd/es/spin';
import NoLicense from 'src/markdown/no-license.md';
import React from 'react';

export function NoLicenseModal(props: NoLicenseModalProps) {
  const {loading, ...restProps} = props;

  return (
    <ModalTemplate {...restProps}>
      <Spin tip="Checking for your license" spinning={loading}>
        <NoLicense />
      </Spin>
    </ModalTemplate>
  );
}

export interface NoLicenseModalProps extends ModalTemplateProps {}
