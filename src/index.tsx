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
import { Component, ImportData, Phase, Project, TypeOfWork } from "./models";
import { jiraRepository } from "./repositories/jira-repository";

const Context = React.createContext({ name: "Default" });

function App() {
  const [api, contextHolder] = notification.useNotification();

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

  React.useEffect(() => {
    jiraRepository
      .projects()
      .pipe(finalize(toggleProjectLoading))
      .subscribe({
        next: (projects) => setProjects(projects),
      });
  }, []);

  const [selectedProject, setSelectedProject] = React.useState<
    string | undefined
  >();

  const [components, setComponents] = React.useState<Component[]>([]);

  React.useEffect(() => {
    if (!!selectedProject) {
      jiraRepository.components(selectedProject).subscribe({
        next: (components) => setComponents(components),
      });
    }
  }, [selectedProject]);

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

  React.useEffect(() => {
    if (selectedProject) {
      jiraRepository.phases(selectedProject).subscribe({
        next: (phases) => setPhases(phases),
      });
    }
  }, [selectedProject]);

  const [tasks, setTasks] = React.useState<ImportData[]>([]);

  const [reporter, setReporter] = React.useState<string>("");

  return (
    <Spin spinning={loading}>
      <Title level={4}>Project</Title>
      <Form labelCol={{ span: 8 }} wrapperCol={{ span: 24 }} layout="vertical">
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

        <Form.Item label="Phase" name="phase" initialValue={selectedComponent}>
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
            disabled={!selectedProject || !selectedComponent || !selectedPhase}
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

        <Form.Item label="Import excel">
          <Input.TextArea
            disabled={
              !selectedProject ||
              !selectedComponent ||
              !selectedPhase ||
              !reporter
            }
            id="excel"
            onChange={(event) => {
              try {
                const text = event.target.value;
                const tasks = text.split("\n").map((line) => {
                  const [index, date, weekNum, task] = line.split("\t");
                  return {
                    date: moment(date),
                    weekNum: Number(weekNum),
                    task,
                  };
                });
                setTasks(tasks);
              } catch (error) {
                openNotification(
                  "bottomRight",
                  "Error parsing data",
                  "Ensure you are using data from Excel template"
                );
                setTasks([]);
              }
            }}
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

        <img className="w-100 mt-2" src="../assets/screenshot-1.png" alt="" />

        <Form.Item name="file">
          <Button
            type="primary"
            className="mt-2"
            htmlType="submit"
            onClick={async () => {
              setLoading(true);
              const user = await firstValueFrom(jiraRepository.authSession());
              const project = projects.find((p) => p.id === selectedProject);
              const component = components.find(
                (c) => c.id === selectedComponent
              );
              const phase = phases.find((p) => p.id === selectedPhase);
              for (const task of tasks) {
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
            }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Context.Provider value={contextValue}>{contextHolder}</Context.Provider>
    </Spin>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
