import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {JiraApp} from 'src/JiraApp';
import type {TabsProps} from 'antd/es/tabs';
import Tabs from 'antd/es/tabs';

const root = ReactDOM.createRoot(document.getElementById('root'));

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Jira',
    children: <JiraApp />,
  },
  {
    key: '2',
    label: 'Devops',
    children: <></>,
  },
];

function PopupApp() {
  const [activeKey, setActiveKey] = React.useState<string>('1');
  return (
    <>
      <Tabs
        defaultActiveKey={activeKey}
        items={items}
        onChange={setActiveKey}
      />
    </>
  );
}

root.render(<PopupApp />);
