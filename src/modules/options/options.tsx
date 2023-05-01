import {Col, Row} from 'antd/es/grid';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import README from 'readme.mdx';
import {App} from 'src/modules/jira/App';
import 'src/config/dayjs';
import {store} from 'src/store';

function OptionsApp() {
  return (
    <Provider store={store}>
      <Row className="py-4">
        <Col span={8} offset={2}>
          <App />
        </Col>
        <Col span={8} offset={4}>
          <README />
        </Col>
      </Row>
    </Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<OptionsApp />);
