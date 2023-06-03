import Button from 'antd/es/button';
import DatePicker from 'antd/es/date-picker';
import Form from 'antd/es/form';
import {Col, Row} from 'antd/es/grid';
import Input from 'antd/es/input';
import List from 'antd/es/list';
import type {ModalProps} from 'antd/es/modal';
import Modal from 'antd/es/modal';
import notification from 'antd/es/notification';
import type {NotificationPlacement} from 'antd/es/notification/interface';
import Select from 'antd/es/select';
import Spin from 'antd/es/spin';
import Switch from 'antd/es/switch';
import Title from 'antd/es/typography/Title';
import type {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import type {FC} from 'react';
import React from 'react';
import {useSelector} from 'react-redux';
import {useBoolean} from 'react3l';
import {firstValueFrom} from 'rxjs';
import {DownloadTemplateButton} from 'src/components/DownloadTemplateButton';
import {UserGuideButton} from 'src/components/UserGuideButton';
import 'src/config/dayjs';
import type {TaskData} from 'src/models';
import {TypeOfWork} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {useJiraState} from 'src/services/use-jira-state';
import {userSelector} from 'src/store/selectors';

const {RangePicker} = DatePicker;

const Context = React.createContext({name: 'Default'});

export const JiraForm: FC<ModalProps> = (props: ModalProps) => {
  const {onOk, ...restProps} = props;

  const contextValue = React.useMemo(() => ({name: 'Ant Design'}), []);

  const [loading, setLoading] = React.useState<boolean>(false);

  const user = useSelector(userSelector);

  const [api, contextHolder] = notification.useNotification();

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

  const [
    projects,
    selectedProject,
    handleSelectProject,
    components,
    selectedComponent,
    handleSelectComponent,
    phases,
    selectedPhase,
    handleSelectPhase,
    reporter,
    handleChangeReporter,
    typeOfWork,
    handleChangeTypeOfWork,
  ] = useJiraState();

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
    const endOfDay = moment().endOf('date');
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
        if (task.date.toDate().getTime() <= endOfDay.toDate().getTime()) {
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
      }
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
        `Please check your data then try again: ${error.message}`,
        api.info,
      );
    } finally {
      setLoading(false);
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

  return (
    <Modal
      {...restProps}
      onOk={async (event) => {
        await handleSubmit();
        onOk && onOk(event);
      }}
      okButtonProps={{
        loading,
      }}>
      <Spin spinning={loading} tip="Creating tasks">
        <div className="mt-4 py-2">
          <Title level={5}>Welcome, {user?.name}!</Title>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="project"
                label="Project"
                initialValue={selectedProject}>
                <Select
                  id="project"
                  showSearch={true}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  placeholder="Select a project"
                  className="w-100"
                  loading={loading}
                  onChange={(value) => {
                    handleSelectProject(value);
                  }}
                  options={projects.map((project) => ({
                    value: project.id,
                    label: project.key,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Component"
                name="component"
                initialValue={selectedComponent}>
                <Select
                  id="component"
                  disabled={!selectedProject}
                  placeholder="Select a component"
                  className="w-100"
                  loading={loading}
                  onChange={(value) => {
                    handleSelectComponent(value);
                  }}
                  options={components.map((component) => ({
                    value: component.id,
                    label: component.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Phase"
                name="phase"
                initialValue={selectedComponent}>
                <Select
                  disabled={!selectedProject || !selectedComponent}
                  placeholder="Select a phase"
                  className="w-100"
                  loading={loading}
                  onChange={(value) => {
                    handleSelectPhase(value);
                  }}
                  options={phases.map((phase) => ({
                    value: phase.id,
                    label: phase.phaseValue,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Reporter"
                name="repoter"
                initialValue={reporter}>
                <Input
                  disabled={
                    !selectedProject || !selectedComponent || !selectedPhase
                  }
                  placeholder="Enter reporter's username"
                  className="w-100"
                  onChange={(event) => {
                    handleChangeReporter(event.target.value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Type of Work"
                name="typeOfWork"
                initialValue={typeOfWork}>
                <Select
                  disabled={
                    !selectedProject || !selectedComponent || !selectedPhase
                  }
                  placeholder="Type of Work"
                  className="w-100"
                  onChange={(value) => {
                    handleChangeTypeOfWork(value);
                  }}
                  options={Object.values(TypeOfWork).map(
                    (selectedTypeOfWork) => ({
                      value: selectedTypeOfWork,
                      label: selectedTypeOfWork,
                    }),
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Auto fill">
                <Switch
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                  checked={isAutoFill}
                  onChange={(_value, _e) => toggleAutoFill()}
                />
              </Form.Item>
            </Col>
          </Row>

          {isAutoFill ? (
            <>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Date range">
                    <RangePicker
                      className="w-100"
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
                </Col>

                <Col span={12}>
                  <Form.Item label="Ignore dates">
                    <DatePicker
                      className="w-100"
                      disabledDate={(current) => {
                        return current.day() <= 0 || current.day() >= 6;
                      }}
                      onChange={(date, _dateString) => {
                        const newState = [
                          ...ignoreDates,
                          date.format('YYYY-MM-DD'),
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
                </Col>
              </Row>

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
              <Form.Item
                label={
                  <div className="w100 d-flex justify-content-between align-items-center">
                    <span>Task Data</span>
                    <DownloadTemplateButton />
                  </div>
                }>
                <Input.TextArea
                  disabled={
                    !selectedProject ||
                    !selectedComponent ||
                    !selectedPhase ||
                    !reporter
                  }
                  placeholder="Copy data only, exclude header and blank lines"
                  id="excel"
                  onChange={(event) => setTaskValue(event.target.value)}
                  rows={10}
                />
              </Form.Item>
            </>
          )}
        </Form>
        <Context.Provider value={contextValue}>
          {contextHolder}
        </Context.Provider>
      </Spin>
    </Modal>
  );
};
