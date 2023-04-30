import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import README from '../../../README.md';
import 'src/config/dayjs';

function App() {
  return (
    <div className="container">
      <README />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);
