import {MinusCircleOutlined} from '@ant-design/icons';
import {Input} from 'antd';
import type {TextAreaProps} from 'antd/lib/input';
import classNames from 'classnames';
import type {FC} from 'react';
import React from 'react';

const MAX_CHAR_COUNT = 250;

export const TextAreaWithCharCount: FC<TextAreaWithCharCountProps> = (
  props: TextAreaWithCharCountProps,
) => {
  const {value, onRemove, ...restProps} = props;

  const rows = React.useMemo(
    () => (value as string)?.split('\n').length ?? 1,
    [value],
  );

  return (
    <div className="textarea-container">
      <Input.TextArea
        {...restProps}
        rows={rows}
        value={value}
        maxLength={MAX_CHAR_COUNT}
      />
      <code
        className={classNames({
          'char-count': true,
          'char-count-1': rows === 1,
        })}>
        {(value as string)?.length}/{MAX_CHAR_COUNT}
      </code>
      <MinusCircleOutlined
        role="button"
        className="remove-item ml-4"
        onClick={onRemove}
      />
    </div>
  );
};

interface TextAreaWithCharCountProps extends TextAreaProps {
  onRemove: () => void;
}
