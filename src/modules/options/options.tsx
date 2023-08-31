import type {Root} from 'react-dom/client';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import README from 'readme.mdx';
import 'src/config/dayjs';
import {store} from 'src/store';

function OptionsApp() {
  return (
    <div className="container py-4">
      <README />
    </div>
  );
}

const root: Root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <OptionsApp />
  </Provider>,
);
