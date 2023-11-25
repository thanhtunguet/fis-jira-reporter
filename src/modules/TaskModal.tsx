import type {FC} from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {GlobalState} from 'src/store';
import {jiraSlice} from 'src/store/slices/jira-slice';
import type {FormItemProps, FormProps} from 'antd/lib/form';
import Form from 'antd/lib/form';
import type {JiraForm} from 'src/models/jira-form';
import Select from 'antd/lib/select';
import {useProjects} from 'src/services/use-projects';
import {isGam} from 'src/helpers/gam';
import GamEch from 'src/components/GamEch';
import {Col, Row} from 'antd/lib/grid';
import Spin from 'antd/lib/spin';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import {TypeOfWork} from 'src/models';
import Tooltip from 'antd/lib/tooltip';
import {useTranslation} from 'react-i18next';
import {usePhases} from 'src/services/use-phases';
import {jiraRepository} from 'src/repositories/jira-repository';
import {captureException} from '@sentry/react';
import {finalize} from 'rxjs';
import {useComponents} from 'src/services/use-components';
import {useReporters} from 'src/services/use-reporters';
import EmptyComponent from 'antd/lib/empty';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import Button from 'antd/lib/button';
import {DatePicker} from 'antd';
import dayjs from 'dayjs';
import {getNextWorkingDay} from 'src/helpers/dayjs';
import {filterFunc} from 'src/helpers/select';
import {excelDateToJSDate, parseExcelData} from 'src/helpers/xlsx';
import {dateService} from 'src/services/date-service';
import {sleep} from 'src/helpers/sleep';
import {taskService} from 'src/services/task-service';
import DownloadTemplateButton from 'src/components/DownloadTemplateButton';

const formItemProps: FormItemProps = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const TaskModal: FC<TaskModalProps> = (): JSX.Element => {
  const [translate] = useTranslation();

  const {user} = useSelector((state: GlobalState) => state.user);

  const {isVisible} = useSelector((state: GlobalState) => state.jira);

  const dispatch = useDispatch();

  const [form] = Form.useForm<JiraForm>();

  const [projects, isLoadingProjects] = useProjects();

  const [isCheckingProject, setIsCheckingProject] =
    React.useState<boolean>(false);

  const selectedProject = form.getFieldValue('project');

  const [components, isLoadingComponents] = useComponents(selectedProject);

  const [phases, isLoadingPhases] = usePhases(selectedProject);

  const [reporters, handleSearchReporter, isSearchingReporters] =
    useReporters();

  const handleSelectProject = React.useCallback(
    (projectId: string) => {
      if (projectId) {
        setIsCheckingProject(true);
        jiraRepository
          .getIssuesInCurrentYear(projectId)
          .pipe(
            finalize(() => {
              setIsCheckingProject(false);
            }),
          )
          .subscribe({
            next: (res) => {
              if (res.total === 0) {
                form.setFields([
                  {
                    name: 'project',
                    value: projectId,
                    errors: [
                      translate('project.closedProject'), //
                    ],
                  },
                ]);
                return;
              }
              form.setFields([
                {
                  name: 'project',
                  value: projectId,
                  errors: [],
                },
              ]);
            },
            error: (error) => {
              captureException(error);
            },
          });
      }
    },
    [form, translate],
  );

  const handlePasteContent = React.useCallback(
    (event: DocumentEventMap['paste']) => {
      // Handle the paste event here
      const clipboardData =
        event.clipboardData || (window as any).clipboardData;

      try {
        const tasks = parseExcelData(clipboardData.getData('text')).map(
          (task) => {
            const {date, ...others} = task;
            return {
              ...others,
              date: excelDateToJSDate(date),
            };
          },
        );

        form.setFields([
          {
            name: 'tasks',
            value: tasks,
          },
        ]);
      } catch (error) {
        form.setFields([
          {
            name: 'tasks',
            value: [],
          },
        ]);
        captureException(error);
      }
    },
    [form],
  );

  React.useEffect(() => {
    document.addEventListener('paste', handlePasteContent);

    return () => {
      document.removeEventListener('paste', handlePasteContent);
    };
  }, [handlePasteContent]);

  const [isCreatingTasks, setIsCreatingTasks] = React.useState<boolean>(false);
  const [taskTip, setTaskTip] = React.useState<string>('');

  const handleSubmit: FormProps['onFinish'] = React.useCallback(
    async (values: JiraForm) => {
      setIsCreatingTasks(true);
      const total = values.tasks.length;
      for (let i = 0; i < total; i++) {
        await taskService.createTasks(values, i);
        const p = (((i + 1) / total) * 100).toFixed(2);
        setTaskTip(
          translate('tasks.creatingTasks', {
            p,
          }),
        );
      }
      setIsCreatingTasks(false);
      setTaskTip('');
      form.resetFields();
      dispatch(jiraSlice.actions.setIsVisible(false));
    },
    [dispatch, form, translate],
  );

  const handleCloseModal = React.useCallback(() => {
    dispatch(jiraSlice.actions.setIsVisible(false));
    form.resetFields();
  }, [dispatch, form]);

  const divRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback(async () => {
    if (divRef.current) {
      await sleep(200);
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, []);

  return (
    <Modal
      width={1200}
      closable={false}
      maskClosable={false}
      centered={true}
      closeIcon={null}
      destroyOnClose={true}
      open={isVisible}
      title={`Welcome ${user?.name}`}
      okText={translate('general.create')}
      onOk={form.submit}
      cancelText={translate('general.cancel')}
      onCancel={handleCloseModal}>
      <Spin
        spinning={isLoadingProjects || isCheckingProject || isCreatingTasks}
        tip={isCreatingTasks ? taskTip : translate('general.loading')}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label={translate('project.title')}
                required={true}
                rules={[
                  {
                    required: true,
                    message: translate('project.missingProject'),
                  },
                ]}
                name="project">
                <Select
                  id="project"
                  showSearch={true}
                  filterOption={filterFunc}
                  placeholder={translate('project.searchPlaceholder')}
                  className="w-100"
                  loading={isLoadingProjects}
                  onChange={handleSelectProject}
                  options={projects.map((project) => ({
                    value: project.id,
                    searchValue: project.key,
                    label: (
                      <div className="d-flex align-items-center">
                        {isGam(user) ? (
                          <GamEch />
                        ) : (
                          <img
                            alt={project.name}
                            src={project.avatarUrls['24x24']}
                            width={16}
                            height={16}
                          />
                        )}
                        <Tooltip title={project.name}>
                          <span className="label">{project.key}</span>
                        </Tooltip>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label={translate('component.title')}
                required={true}
                rules={[
                  {
                    required: true,
                    message: translate('component.missingComponent'),
                  },
                ]}
                name="component">
                <Select
                  disabled={!selectedProject}
                  options={components.map((component) => ({
                    label: (
                      <div>
                        <span>{component.name}</span>
                      </div>
                    ),
                    value: component.id,
                    searchValue: component.name,
                  }))}
                  loading={isLoadingComponents}
                  showSearch={true}
                  filterOption={filterFunc}
                  placeholder={translate('component.searchPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label={translate('phase.title')}
                required={true}
                rules={[
                  {
                    required: true,
                    message: translate('phase.missingPhase'),
                  },
                ]}
                name="phase">
                <Select
                  disabled={!selectedProject}
                  loading={isLoadingPhases}
                  showSearch={true}
                  filterOption={filterFunc}
                  options={phases.map((phase) => ({
                    label: (
                      <div>
                        <span>{phase.phaseValue}</span>
                      </div>
                    ),
                    value: phase.id,
                    searchValue: phase.phaseValue,
                  }))}
                  placeholder={translate('phase.searchPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label={translate('user.reporter')}
                required={true}
                rules={[
                  {
                    required: true,
                    message: translate('user.missingReporter'),
                  },
                ]}
                name="reporter">
                <Select
                  options={reporters.map((reporter) => ({
                    label: (
                      <div className="d-flex align-items-center">
                        <img
                          alt={reporter.name}
                          src={reporter.avatarUrl}
                          width={16}
                          height={16}
                        />
                        <span className="label">
                          {reporter.displayName} (<code>{reporter.name}</code>)
                        </span>
                      </div>
                    ),
                    value: reporter.name,
                    searchValue: reporter.name,
                  }))}
                  showSearch={true}
                  loading={isSearchingReporters}
                  onSearch={handleSearchReporter}
                  notFoundContent={<EmptyComponent />}
                  placeholder={translate('user.reporterSearchPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label={translate('typeOfWork.title')}
                required={true}
                rules={[
                  {
                    required: true,
                    message: translate('typeOfWork.missingTypeOfWork'),
                  },
                ]}
                initialValue={TypeOfWork.Create}
                name="typeOfWork">
                <Select
                  placeholder={translate('typeOfWork.searchPlaceholder')}
                  options={Object.values(TypeOfWork).map((type) => ({
                    value: type,
                    label: (
                      <div className="d-flex align-items-center">
                        {isGam(user) ? <GamEch /> : null}
                        <span className="mx-2">{type}</span>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div />
            </Col>
          </Row>

          <Form.List
            name="tasks"
            rules={[
              {
                validator: taskService.validateTasks,
              },
            ]}>
            {(fields, {add, remove}) => (
              <>
                <div className="task-list" ref={divRef}>
                  {fields.map(({key, name, ...restField}) => (
                    <Row key={key} gutter={12}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          {...formItemProps}
                          label={translate('tasks.date')}
                          name={[name, 'date']}
                          rules={[
                            {
                              validator: dateService.validateCurrentDate,
                              message: translate('tasks.invalidDate'),
                            },
                          ]}>
                          <DatePicker
                            placeholder={translate('tasks.date')}
                            className="w-100"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={15}>
                        <Form.Item
                          {...restField}
                          {...formItemProps}
                          label={translate('tasks.description')}
                          name={[name, 'description']}
                          rules={[
                            {
                              required: true,
                              message: translate('tasks.missingDescription'),
                            },
                          ]}>
                          <Input placeholder={translate('tasks.description')} />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                </div>
                <div>
                  <span>Paste the whole sheet here to import tasks</span>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                  <Button
                    className="flex-grow-1"
                    type="dashed"
                    onClick={async () => {
                      const tasks = form.getFieldValue('tasks');
                      if (tasks instanceof Array && tasks.length > 0) {
                        const {date} = tasks[tasks.length - 1];
                        add({
                          date: getNextWorkingDay(date),
                          description: '',
                        });
                        await scrollToBottom();
                        return;
                      }
                      add({
                        date: getNextWorkingDay(
                          dayjs().startOf('month').subtract(1, 'day'),
                        ),
                        description: '',
                      });
                    }}
                    icon={<PlusOutlined />}>
                    {translate('tasks.addTask')}
                  </Button>
                  <DownloadTemplateButton />
                </div>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Modal>
  );
};

export interface TaskModalProps {
  //
}

TaskModal.defaultProps = {};

export default TaskModal;
