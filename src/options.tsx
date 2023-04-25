import DatePicker from "antd/es/date-picker";
import "bootstrap/dist/css/bootstrap.min.css";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import React from "react";
import ReactDOM from "react-dom/client";
import README from "../README.mdx";

dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

const Context = React.createContext({ name: "Default" });

function App() {
  return <README />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
