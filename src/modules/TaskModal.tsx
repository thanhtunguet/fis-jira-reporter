import {CopyOutlined, PlusOutlined} from '@ant-design/icons';
import {captureException} from '@sentry/react';
import {
  Button,
  Col,
  DatePicker,
  Empty as EmptyComponent,
  Form,
  Modal,
  Row,
  Select,
  Spin,
  Tooltip,
} from 'antd';
import type {FormItemProps, FormProps} from 'antd/lib/form';
import dayjs from 'dayjs';
import type {FC} from 'react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {finalize, firstValueFrom} from 'rxjs';
import DownloadTemplateButton from 'src/components/DownloadTemplateButton';
import {TextAreaWithCharCount} from 'src/components/TextAreaWithCharCount';
import {getNextWorkingDay} from 'src/helpers/dayjs';
import {filterFunc} from 'src/helpers/select';
import {sleep} from 'src/helpers/sleep';
import {excelDateToJSDate, parseExcelData} from 'src/helpers/xlsx';
import {TypeOfWork} from 'src/models';
import type {JiraForm} from 'src/models/jira-form';
import {jiraRepository} from 'src/repositories/jira-repository';
import {telegramRepository} from 'src/repositories/telegram-repository';
import {dateService} from 'src/services/date-service';
import {taskService} from 'src/services/task-service';
import {useComponents} from 'src/services/use-components';
import {usePhases} from 'src/services/use-phases';
import {useProjects} from 'src/services/use-projects';
import {useReporters} from 'src/services/use-reporters';
import {useUser} from 'src/services/use-user';
import type {GlobalState} from 'src/store';
import {jiraSlice} from 'src/store/slices/jira-slice';
import {LicenseStatus} from 'src/types/LicenseStatus';

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

  const [user, , licenseStatus] = useUser();

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

  const handlePasteContent = React.useCallback(async () => {
    try {
      // Handle the paste event here
      const data = await navigator.clipboard.readText();
      const tasks = parseExcelData(data).map((task) => {
        const {date, ...others} = task;
        return {
          ...others,
          date: excelDateToJSDate(date),
        };
      });

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
  }, [form]);

  const [isCreatingTasks, setIsCreatingTasks] = React.useState<boolean>(false);
  const [taskTip, setTaskTip] = React.useState<string>('');

  const isValidLicense = licenseStatus === LicenseStatus.VALID;

  const handleSubmit: FormProps['onFinish'] = React.useCallback(
    async (values: JiraForm) => {
      if (!isValidLicense) {
        return;
      }
      if (!isCreatingTasks) {
        setIsCreatingTasks(true);
        const project = projects.find((p) => p.id === values.project);
        const component = components.find((c) => c.id === values.component);
        const total = values.tasks.length;

        for (let i = 0; i < total; i++) {
          await taskService.createTasks(values, i, user!, project!, component!);
          const p = (((i + 1) / total) * 100).toFixed(2);
          setTaskTip(
            translate('tasks.creatingTasks', {
              p,
            }),
          );
        }

        setIsCreatingTasks(false);
        dispatch(jiraSlice.actions.setIsVisible(false));
        setTaskTip('');
        form.resetFields();
        await firstValueFrom(
          telegramRepository.sendMessage(
            `${user?.name} created ${values.tasks.length} tasks`,
          ),
        );
      }
    },
    [components, dispatch, form, projects, translate, user, isCreatingTasks],
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
      className="h-100"
      forceRender={true}
      width={1200}
      closable={false}
      maskClosable={false}
      centered={true}
      closeIcon={null}
      destroyOnClose={true}
      open={isVisible}
      title={translate('user.welcome', {name: user?.name})}
      okText={translate('general.create')}
      onOk={form.submit}
      okButtonProps={{
        disabled: !isValidLicense || !form.isFieldsTouched(),
      }}
      cancelText={translate('general.cancel')}
      onCancel={handleCloseModal}>
      {!isValidLicense && (
        <div className="mb-4">
          <span className="text-danger">
            {translate('license.invalidLicense')}
          </span>
          <a
            target="_blank"
            className="mx-2"
            href={chrome.runtime.getURL('assets/thanhtunguet-qr-jira.png')}>
            Open QR Code
          </a>
          <span>to purchase a license</span>
        </div>
      )}
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
                        <img
                          alt={project.name}
                          src={project.avatarUrls['24x24']}
                          width={16}
                          height={16}
                        />
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
                          label={translate('tasks.date')}
                          name={[name, 'date']}
                          required={true}
                          rules={[
                            {
                              validator: dateService.validateCurrentDate,
                              message: translate('tasks.invalidDate'),
                            },
                          ]}>
                          <DatePicker
                            className="w-100"
                            placeholder={translate('tasks.date')}
                          />
                        </Form.Item>
                      </Col>
                      <Col
                        span={16}
                        className="d-flex justify-content-start align-items-center">
                        <Form.Item
                          {...restField}
                          className="flex-grow-1"
                          label={translate('tasks.description')}
                          name={[name, 'description']}
                          rules={[
                            {
                              required: true,
                              message: translate('tasks.missingDescription'),
                            },
                          ]}>
                          <TextAreaWithCharCount
                            placeholder={translate('tasks.description')}
                            onRemove={() => remove(name)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </div>
                <div className="d-flex justify-content-center align-items-center">
                  <Button
                    type="primary"
                    onClick={handlePasteContent}
                    icon={<CopyOutlined />}>
                    {translate('tasks.pasteToImport')}
                  </Button>
                  <Button
                    className="flex-grow-1 mx-2"
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

                <span>
                  To import from Excel, use <code>Ctrl + A / Ctrl + C</code> to
                  copy the task table from Excel sheet, then use this button to
                  paste the tasks here.
                </span>
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
