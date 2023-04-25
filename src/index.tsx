import Button from "antd/es/button";
import Form from "antd/es/form";
import Input from "antd/es/input";
import notification from "antd/es/notification";
import { NotificationPlacement } from "antd/es/notification/interface";
import Select from "antd/es/select";
import Title from "antd/es/typography/Title";
import Spin from "antd/es/spin";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import React from "react";
import ReactDOM from "react-dom/client";
import { useBoolean } from "react3l";
import { finalize, firstValueFrom } from "rxjs";
import { Component, TaskData, Phase, Project, TypeOfWork } from "./models";
import { jiraRepository } from "./repositories/jira-repository";
import DatePicker from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";
import List from "antd/es/list";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Switch from "antd/es/switch";

dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

const Context = React.createContext({ name: "Default" });

function App() {
  const [api, contextHolder] = notification.useNotification();

  const [user, setUser] = React.useState<any>(null);

  const openNotification = (
    placement: NotificationPlacement,
    message: string,
    description: string,
    method = api.error
  ) => {
    method({
      message: message,
      description: <Context.Consumer>{({}) => description}</Context.Consumer>,
      placement,
    });
  };

  const contextValue = React.useMemo(() => ({ name: "Ant Design" }), []);

  const [loading, setLoading] = React.useState<boolean>(false);

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectLoading, toggleProjectLoading] = useBoolean(true);
  const [selectedProject, setSelectedProject] = React.useState<
    string | undefined
  >();

  const [components, setComponents] = React.useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = React.useState<
    string | undefined
  >();

  const [phases, setPhases] = React.useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = React.useState<
    number | undefined
  >();

  const [typeOfWork, setTypeOfWork] = React.useState<TypeOfWork>(
    TypeOfWork.Create
  );
  const [reporter, setReporter] = React.useState<string>("");

  const [isAutoFill, toggleAutoFill] = useBoolean(true);
  const [dates, setDates] = React.useState<[Dayjs, Dayjs]>(null);
  const [ignoreDates, setIgnoreDates] = React.useState<string[]>([]);
  const [taskValue, setTaskValue] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");

  React.useEffect(() => {
    jiraRepository.authSession().subscribe({
      next: (user) => setUser(user),
    });
  }, []);

  React.useEffect(() => {
    jiraRepository
      .projects()
      .pipe(finalize(toggleProjectLoading))
      .subscribe({
        next: (projects) => setProjects(projects),
      });
  }, []);

  React.useEffect(() => {
    if (!!selectedProject) {
      jiraRepository.components(selectedProject).subscribe({
        next: (components) => setComponents(components),
      });
    }
  }, [selectedProject]);

  React.useEffect(() => {
    if (selectedProject) {
      jiraRepository.phases(selectedProject).subscribe({
        next: (phases) => setPhases(phases),
      });
    }
  }, [selectedProject]);

  return (
    <div className="p-2">
      {user ? (
        <Spin spinning={loading}>
          <div className="d-flex justify-content-between">
            <Title level={5}>Welcome, {user.name}!</Title>
            <Button
              type="default"
              role="link"
              onClick={() => {
                chrome.runtime.openOptionsPage();
              }}
            >
              User guide
            </Button>
          </div>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 24 }}
            layout="vertical"
          >
            <Form.Item
              name="project"
              label="Project"
              initialValue={selectedProject}
            >
              <Select
                id="project"
                placeholder="Select a project"
                className="w-100"
                loading={projectLoading}
                onChange={(value) => {
                  setSelectedProject(value);
                  setSelectedComponent(undefined);
                  setSelectedPhase(undefined);
                }}
                options={projects.map((project) => ({
                  value: project.id,
                  label: project.key,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Component"
              name="component"
              initialValue={selectedComponent}
            >
              <Select
                id="component"
                disabled={!selectedProject}
                placeholder="Select a component"
                className="w-100"
                onChange={(value) => {
                  setSelectedComponent(value);
                }}
                options={components.map((component) => ({
                  value: component.id,
                  label: component.name,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Phase"
              name="phase"
              initialValue={selectedComponent}
            >
              <Select
                disabled={!selectedProject}
                placeholder="Select a phase"
                className="w-100"
                onChange={(value) => {
                  setSelectedPhase(value);
                }}
                options={phases.map((phase) => ({
                  value: phase.id,
                  label: phase.phaseValue,
                }))}
              />
            </Form.Item>

            <Form.Item label="Reporter" name="repoter" initialValue={reporter}>
              <Input
                disabled={!selectedProject}
                placeholder="Enter reporter's username"
                className="w-100"
                onChange={(event) => {
                  setReporter(event.target.value);
                }}
              />
            </Form.Item>

            <Form.Item
              label="Type of Work"
              name="typeOfWork"
              initialValue={typeOfWork}
            >
              <Select
                disabled={
                  !selectedProject || !selectedComponent || !selectedPhase
                }
                placeholder="Type of Work"
                className="w-100"
                onChange={(value) => {
                  setTypeOfWork(value);
                }}
                options={Object.values(TypeOfWork).map((typeOfWork) => ({
                  value: typeOfWork,
                  label: typeOfWork,
                }))}
              />
            </Form.Item>

            <Form.Item label="Auto fill">
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
                checked={isAutoFill}
                onChange={(_value, _e) => toggleAutoFill()}
              />
            </Form.Item>

            {isAutoFill ? (
              <>
                <Form.Item label="Date range">
                  <RangePicker
                    value={dates}
                    showTime
                    placement="topLeft"
                    disabledTime={(_) => {
                      return {
                        disabledHours: () =>
                          Array.from({ length: 23 }, (_, i) => i + 1),
                        disabledMinutes: () =>
                          Array.from({ length: 59 }, (_, i) => i + 1),
                        disabledSeconds: () =>
                          Array.from({ length: 59 }, (_, i) => i + 1),
                      };
                    }}
                    disabledDate={(current) => {
                      return current.day() <= 0 || current.day() >= 6;
                    }}
                    onChange={(dates) =>
                      setDates([
                        dates[0].startOf("day"),
                        dates[1].startOf("day"),
                      ])
                    }
                  />
                </Form.Item>

                <Form.Item label="Ignore dates">
                  <DatePicker
                    disabledDate={(current) => {
                      return current.day() <= 0 || current.day() >= 6;
                    }}
                    onChange={(date, _dateString) => {
                      const newState = [
                        ...ignoreDates,
                        date.format("YYYY-MM-DD"),
                      ];
                      setIgnoreDates(newState);
                    }}
                  />
                  {ignoreDates && ignoreDates.length > 0 && (
                    <>
                      <List
                        dataSource={ignoreDates}
                        renderItem={(item: string) => (
                          <List.Item>
                            {dayjs(item).format("ddd, DD/MM/YYYY")}
                          </List.Item>
                        )}
                      />
                      <Button
                        danger
                        onClick={(_e: any) => {
                          const newState = ignoreDates.slice(0, -1);
                          setIgnoreDates(newState);
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </Form.Item>

                <Form.Item label="Task description">
                  <Input
                    placeholder="Enter description"
                    className="w-100"
                    onChange={(event) => {
                      setDescription(event.target.value);
                    }}
                  />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label="Import task data">
                  <Input.TextArea
                    disabled={
                      !selectedProject ||
                      !selectedComponent ||
                      !selectedPhase ||
                      !reporter
                    }
                    placeholder="Edit the template then copy the parts you want (image) to import and paste here"
                    id="excel"
                    onChange={(event) => setTaskValue(event.target.value)}
                    rows={10}
                  />
                </Form.Item>

                <a
                  className="my-2"
                  role="button"
                  href="../assets/jira.excel.template.xlsx"
                  download="jira.excel.template.xlsx"
                >
                  Download template
                </a>

                <img className="w-100 mt-2" src="../assets/excel.jpg" alt="" />
              </>
            )}

            <Form.Item name="file">
              <Button
                type="primary"
                className="mt-2"
                htmlType="submit"
                onClick={async () => {
                  try {
                    let tasks: TaskData[] = [];
                    if (isAutoFill) {
                      const [startDate, endDate] = dates;
                      let currDate = startDate.clone().startOf("day");

                      while (currDate.isSameOrBefore(endDate)) {
                        if (
                          currDate.day() > 0 &&
                          currDate.day() < 6 &&
                          !ignoreDates.includes(currDate.format("YYYY-MM-DD"))
                        )
                          tasks.push({
                            date: moment(currDate.toDate()),
                            weekNum: 0,
                            task: description,
                          });
                        currDate = currDate.add(1, "day");
                      }
                    } else {
                      tasks = taskValue.split("\n").map((line) => {
                        const [_index, date, weekNum, task] = line.split("\t");
                        return {
                          date: moment(date),
                          weekNum: Number(weekNum),
                          task,
                        };
                      });
                    }
                    setLoading(true);
                    const project = projects.find(
                      (p) => p.id === selectedProject
                    );
                    const component = components.find(
                      (c) => c.id === selectedComponent
                    );
                    const phase = phases.find((p) => p.id === selectedPhase);
                    for (const task of tasks) {
                      console.log(task);
                      const jiraTask = await firstValueFrom(
                        jiraRepository.task(
                          user.name,
                          reporter,
                          project,
                          component,
                          task.date,
                          task.task
                        )
                      );
                      const workLog = await firstValueFrom(
                        jiraRepository.worklog(
                          jiraTask,
                          task.task,
                          phase,
                          user,
                          task.date,
                          typeOfWork
                        )
                      );
                      await firstValueFrom(jiraRepository.complete(jiraTask));
                    }
                    setLoading(false);
                    openNotification(
                      "bottomRight",
                      "All tasks are completed",
                      "All tasks from Excel have been created and completed",
                      api.info
                    );
                  } catch (err) {
                    openNotification(
                      "bottomRight",
                      "An error occured",
                      "Please double check your data then try again",
                      api.info
                    );
                  }
                }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Context.Provider value={contextValue}>
            {contextHolder}
          </Context.Provider>
        </Spin>
      ) : (
        <p>
          Please login to{" "}
          <span>
            <a href="https://jira.fis.com.vn" target="_blank">
              JIRA
            </a>
          </span>{" "}
          first then re-open this extension
        </p>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
