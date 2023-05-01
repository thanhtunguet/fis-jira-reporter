import {PlusCircleOutlined} from '@ant-design/icons';
import FloatButton from 'antd/es/float-button';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {openOptionsPage} from './helpers/open-options-page';

const App: React.FC = () => (
  <>
    <FloatButton
      icon={<PlusCircleOutlined />}
      type="primary"
      onClick={openOptionsPage}
    />
  </>
);

export default App;

const rootDiv = document.createElement('div');
rootDiv.id = 'jira-root-div';
document.body.appendChild(rootDiv);
const root = createRoot(rootDiv);
root.render(<App />);
