import Form from "antd/es/form";
import Select from "antd/es/select";
import Title from "antd/es/typography/Title";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom";

ReactDOM.render(
  <>
    <Title level={4}>Project</Title>
    <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} layout="horizontal">
      <Form.Item label="Project" name="size">
        <Select
          defaultValue="lucy"
          className="w-100"
          onChange={() => {
            //
          }}
          options={[
            { value: "jack", label: "Jack" },
            { value: "lucy", label: "Lucy" },
            { value: "Yiminghe", label: "yiminghe" },
            { value: "disabled", label: "Disabled", disabled: true },
          ]}
        />
      </Form.Item>

      <Form.Item label="Component" name="size">
        <Select
          defaultValue="lucy"
          className="w-100"
          onChange={() => {
            //
          }}
          options={[
            { value: "jack", label: "Jack" },
            { value: "lucy", label: "Lucy" },
            { value: "Yiminghe", label: "yiminghe" },
            { value: "disabled", label: "Disabled", disabled: true },
          ]}
        />
      </Form.Item>
    </Form>
  </>,
  document.getElementById("root")
);
