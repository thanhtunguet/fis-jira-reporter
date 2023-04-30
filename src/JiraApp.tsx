import type {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import DatePicker from 'antd/es/date-picker';
import React from 'react';
import notification from 'antd/es/notification';
import {useUser} from 'src/services/use-user';
import type {NotificationPlacement} from 'antd/es/notification/interface';
import {useProjects} from 'src/services/use-projects';
import {useComponents} from 'src/services/use-components';
import {usePhases} from 'src/services/use-phases';
import type {TaskData} from 'src/models/models';
import {TypeOfWork} from 'src/models/models';
import {useBoolean} from 'react3l';
import Spin from 'antd/es/spin';
import Title from 'antd/es/typography/Title';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Select from 'antd/es/select';
import Input from 'antd/es/input';
import Switch from 'antd/es/switch';
import List from 'antd/es/list';
import moment from 'moment/moment';
import {firstValueFrom} from 'rxjs';
import {jiraRepository} from 'src/repositories/jira-repository';
import NoLicense from 'src/markdown/no-license.md';
import NoLogin from 'src/markdown/no-login.md';
import 'src/config/dayjs';
import {UserGuideButton} from 'src/components/UserGuideButton';

const {RangePicker} = DatePicker;

const Context = React.createContext({name: 'Default'});

export function JiraApp() {
  const [api, contextHolder] = notification.useNotification();

  const [user, userLoading, isValidLicense] = useUser();

  const openNotification = React.useCallback(
    (
      placement: NotificationPlacement,
      message: string,
      description: string,
      method = api.error,
    ) => {
      method({
        message: message,
        description: <Context.Consumer>{({}) => description}</Context.Consumer>,
        placement,
      });
    },
    [api.error],
  );

  const contextValue = React.useMemo(() => ({name: 'Ant Design'}), []);

  const [loading, setLoading] = React.useState<boolean>(false);

  const [projects, projectLoading] = useProjects();
  const [selectedProject, setSelectedProject] = React.useState<
    string | undefined
  >();

  const [components, componentLoading] = useComponents(selectedProject);
  const [selectedComponent, setSelectedComponent] = React.useState<
    string | undefined
  >();

  const [phases, phaseLoading] = usePhases(selectedProject);
  const [selectedPhase, setSelectedPhase] = React.useState<
    number | undefined
  >();

  const [typeOfWork, setTypeOfWork] = React.useState<TypeOfWork>(
    TypeOfWork.Create,
  );
  const [reporter, setReporter] = React.useState<string>('');

  const [isAutoFill, toggleAutoFill] = useBoolean(false);
  const [dates, setDates] = React.useState<[Dayjs, Dayjs]>(null);
  const [ignoreDates, setIgnoreDates] = React.useState<string[]>([]);
  const [taskValue, setTaskValue] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');

  const disabledTime = React.useCallback((_) => {
    return {
      disabledHours: () => Array.from({length: 23}, (...[, i]) => i + 1),
      disabledMinutes: () => Array.from({length: 59}, (...[, i]) => i + 1),
      disabledSeconds: () => Array.from({length: 59}, (...[, i]) => i + 1),
    };
  }, []);

  const handleSubmit = React.useCallback(async () => {
    try {
      let tasks: TaskData[] = [];
      if (isAutoFill) {
        const [startDate, endDate] = dates;
        let currDate = startDate.clone().startOf('day');

        while (currDate.isSameOrBefore(endDate)) {
          if (
            currDate.day() > 0 &&
            currDate.day() < 6 &&
            !ignoreDates.includes(currDate.format('YYYY-MM-DD'))
          ) {
            tasks.push({
              date: moment(currDate.toDate()),
              weekNum: 0,
              task: description,
            });
          }
          currDate = currDate.add(1, 'day');
        }
      } else {
        tasks = taskValue.split('\n').map((line) => {
          const [_index, date, weekNum, task] = line.split('\t');
          return {
            date: moment(date),
            weekNum: Number(weekNum),
            task,
          };
        });
      }
      setLoading(true);
      const project = projects.find((p) => p.id === selectedProject);
      const component = components.find((c) => c.id === selectedComponent);
      const phase = phases.find((p) => p.id === selectedPhase);
      for (const task of tasks) {
        const jiraTask = await firstValueFrom(
          jiraRepository.task(
            user.name,
            reporter,
            project,
            component,
            task.date,
            task.task,
          ),
        );
        await firstValueFrom(
          jiraRepository.createWorkLog(
            jiraTask,
            task.task,
            phase,
            user,
            task.date,
            typeOfWork,
          ),
        );
        await firstValueFrom(jiraRepository.complete(jiraTask));
      }
      setLoading(false);
      openNotification(
        'bottomRight',
        'All tasks are completed',
        'All tasks from Excel have been created and completed',
        api.info,
      );
    } catch (error) {
      openNotification(
        'bottomRight',
        'An error occurred',
        `Please double check your data then try again: ${error.message}`,
        api.info,
      );
    }
  }, [
    api.info,
    components,
    dates,
    description,
    ignoreDates,
    isAutoFill,
    openNotification,
    phases,
    projects,
    reporter,
    selectedComponent,
    selectedPhase,
    selectedProject,
    taskValue,
    typeOfWork,
    user,
  ]);

  if (!user) {
    return (
      <Spin spinning={userLoading} tip="Checking user login's info">
        <NoLogin />
      </Spin>
    );
  }

  if (!isValidLicense) {
    return (
      <Spin spinning={userLoading} tip="Checking license status">
        <NoLicense />
      </Spin>
    );
  }

  return (
    <Spin spinning={loading} tip="Creating tasks">
      <div className="d-flex justify-content-between align-items-center">
        <Title level={5}>Welcome, {user.name}!</Title>
        <UserGuideButton />
      </div>
      <Form labelCol={{span: 8}} wrapperCol={{span: 24}} layout="vertical">
        <Form.Item
          name="project"
          label="Project"
          initialValue={selectedProject}>
          <Select
            id="project"
            showSearch={true}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
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
          initialValue={selectedComponent}>
          <Select
            id="component"
            disabled={!selectedProject}
            placeholder="Select a component"
            className="w-100"
            loading={componentLoading}
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
            loading={phaseLoading}
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
          initialValue={typeOfWork}>
          <Select
            disabled={!selectedProject || !selectedComponent || !selectedPhase}
            placeholder="Type of Work"
            className="w-100"
            onChange={(value) => {
              setTypeOfWork(value);
            }}
            options={Object.values(TypeOfWork).map((selectedTypeOfWork) => ({
              value: selectedTypeOfWork,
              label: selectedTypeOfWork,
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
                disabledTime={disabledTime}
                disabledDate={(current) => {
                  return current.day() <= 0 || current.day() >= 6;
                }}
                onChange={(selectedDates) =>
                  setDates([
                    selectedDates[0].startOf('day'),
                    selectedDates[1].startOf('day'),
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
                  const newState = [...ignoreDates, date.format('YYYY-MM-DD')];
                  setIgnoreDates(newState);
                }}
              />
              {ignoreDates && ignoreDates.length > 0 && (
                <>
                  <List
                    dataSource={ignoreDates}
                    renderItem={(item: string) => (
                      <List.Item>
                        {dayjs(item).format('ddd, DD/MM/YYYY')}
                      </List.Item>
                    )}
                  />
                  <Button
                    danger
                    onClick={(_e: any) => {
                      const newState = ignoreDates.slice(0, -1);
                      setIgnoreDates(newState);
                    }}>
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
              href="assets/jira.excel.template.xlsx"
              download="jira.excel.template.xlsx">
              Download template
            </a>
          </>
        )}

        <Form.Item name="file">
          <Button
            type="primary"
            className="mt-2"
            htmlType="submit"
            onClick={handleSubmit}>
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Context.Provider value={contextValue}>{contextHolder}</Context.Provider>
    </Spin>
  );
}
