import Button from 'antd/es/button';
import DatePicker from 'antd/es/date-picker';
import Form from 'antd/es/form';
import {Col, Row} from 'antd/es/grid';
import Input from 'antd/es/input';
import List from 'antd/es/list';
import type {ModalProps} from 'antd/es/modal';
import notification from 'antd/es/notification';
import type {NotificationPlacement} from 'antd/es/notification/interface';
import Select from 'antd/es/select';
import Spin from 'antd/es/spin';
import Switch from 'antd/es/switch';
import Tag from 'antd/es/tag';
import Title from 'antd/es/typography/Title';
import type {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import type {FC} from 'react';
import React from 'react';
import {useSelector} from 'react-redux';
import {useBoolean} from 'react3l';
import {firstValueFrom} from 'rxjs';
import slugify from 'slugify';
import {DownloadTemplateButton} from 'src/components/DownloadTemplateButton';
import 'src/config/dayjs';
import type {TaskData} from 'src/models';
import {TypeOfWork} from 'src/models';
import {jiraRepository} from 'src/repositories/jira-repository';
import {useJiraState} from 'src/services/use-jira-state';
import {useReporters} from 'src/services/use-reporters';
import {userSelector} from 'src/store/selectors';

const {RangePicker} = DatePicker;

const Context = React.createContext({name: 'Default'});

const gamImage =
  'https://scontent-hkg4-1.xx.fbcdn.net/v/t1.6435-9/159821406_1436157616721922_1000696192939493171_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=174925&_nc_ohc=PKE8vhewMsIAX_fkGSU&_nc_ht=scontent-hkg4-1.xx&oh=00_AfAYot1Pr-xLuXoRoN8ec6Wn_gyLg-xbRmHeytVOtzVdCQ&oe=6519BDA9';

export const JiraForm: FC<ModalProps> = () => {
  const contextValue = React.useMemo(() => ({name: 'Ant Design'}), []);

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

  const [loading, setLoading] = React.useState<boolean>(false);

  const user = useSelector(userSelector);

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

  const disabledTime = React.useCallback(() => {
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
        tasks = taskValue
          .trim()
          .split('\n')
          .map((line) => {
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

  const [reporters, handleSearchReporter] = useReporters();

  const filterOption = React.useCallback((input, option) => {
    return slugify(option?.searchValue ?? '')
      .toLowerCase()
      .includes(slugify(input.toLowerCase()));
  }, []);

  const lowerCaseUsername = user?.name?.toLowerCase();
  const isGam =
    lowerCaseUsername === 'tungpt46' || lowerCaseUsername === 'gamhth2';

  return (
    <>
      <Spin spinning={loading} tip="Creating tasks">
        <Title level={5}>Welcome, {user?.name}!</Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="project"
                label="Project"
                required={true}
                initialValue={selectedProject}>
                <Select
                  id="project"
                  showSearch={true}
                  filterOption={filterOption}
                  placeholder="Select a project, type to search"
                  className="w-100"
                  loading={loading}
                  onChange={handleSelectProject}
                  options={projects.map((project) => ({
                    value: project.id,
                    searchValue: project.key,
                    label: (
                      <div className="inline-flex align-items-center">
                        <img
                          alt={project.name}
                          src={isGam ? gamImage : project.avatarUrls['24x24']}
                          width={20}
                          height={20}
                        />
                        <span className="mx-2">{project.key}</span>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Component"
                name="component"
                required={true}
                initialValue={selectedComponent}>
                <Select
                  id="component"
                  disabled={!selectedProject}
                  placeholder="Select a component, type to search"
                  className="w-100"
                  loading={loading}
                  showSearch={true}
                  filterOption={filterOption}
                  onChange={handleSelectComponent}
                  options={components.map((component) => ({
                    value: component.id,
                    searchValue: component.name,
                    label: (
                      <div className="inline-flex align-items-center">
                        <img
                          src={
                            isGam
                              ? gamImage
                              : 'https://static-00.iconduck.com/assets.00/figma-component-icon-2048x2048-87la2sw0.png'
                          }
                          alt=""
                          width={20}
                          height={20}
                          className="m-1"
                        />
                        <span className="mx-2">{component.name}</span>
                      </div>
                    ),
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
                required={true}
                initialValue={selectedComponent}>
                <Select
                  disabled={!selectedProject || !selectedComponent}
                  placeholder="Select a phase"
                  className="w-100"
                  loading={loading}
                  showSearch={true}
                  filterOption={filterOption}
                  onChange={handleSelectPhase}
                  options={phases.map((phase) => ({
                    value: phase.id,
                    searchValue: phase.phaseValue,
                    label: (
                      <div className="inline-flex align-items-center">
                        <img
                          src={
                            isGam
                              ? gamImage
                              : 'https://static-00.iconduck.com/assets.00/figma-component-icon-2048x2048-87la2sw0.png'
                          }
                          alt=""
                          width={20}
                          height={20}
                          className="m-1"
                        />
                        <span className="mx-2">{phase.phaseValue}</span>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Reporter"
                required={true}
                name="reporter"
                initialValue={reporter}>
                <Select
                  disabled={
                    !selectedProject || !selectedComponent || !selectedPhase
                  }
                  placeholder="Enter reporter's username"
                  showSearch={true}
                  onSearch={handleSearchReporter}
                  className="w-100"
                  onChange={handleChangeReporter}
                  options={reporters.map(({name, displayName, avatarUrl}) => ({
                    value: name,
                    searchValue: name,
                    label: (
                      <div className="inline-flex justify-content-start align-items-center">
                        <img src={avatarUrl} alt={displayName} />

                        <span className="reporter-option mx-2">
                          {displayName}
                        </span>

                        <Tag color="magenta">{name}</Tag>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Type of Work"
                name="typeOfWork"
                required={true}
                initialValue={typeOfWork}>
                <Select
                  disabled={
                    !selectedProject || !selectedComponent || !selectedPhase
                  }
                  placeholder="Type of Work"
                  className="w-100"
                  onChange={handleChangeTypeOfWork}
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

              <Form.Item
                label="Task description"
                extra={
                  <span className="text-italic my-2">
                    Lưu ý: Autofill chỉ dùng cho các task trong tuần, không{' '}
                    khuyến khích autofill một nội dung cho khoảng thời gian trên{' '}
                    5 ngày liên tiếp.
                  </span>
                }>
                <Input.TextArea
                  rows={6}
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
                }
                required={true}>
                <Input.TextArea
                  disabled={
                    !selectedProject ||
                    !selectedComponent ||
                    !selectedPhase ||
                    !reporter
                  }
                  placeholder="<STT>	<Date>	<WeekNumber>	<Task Description>"
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
    </>
  );
};
