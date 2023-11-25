import type {FC} from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {GlobalState} from 'src/store';
import {jiraSlice} from 'src/store/slices/jira-slice';
import type {FormItemProps} from 'antd/lib/form';
import Form from 'antd/lib/form';
import type {JiraForm} from 'src/models/jira-form';
import Select from 'antd/lib/select';
import {useProjects} from 'src/services/use-projects';
import slugify from 'slugify';
import {isGam} from 'src/helpers/gam';
import GamEch from 'src/components/GamEch';
import {Col, Row, Spin} from 'antd';
import type {OptionType} from 'src/types/OptionType';
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

const formItemProps: FormItemProps = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

function filterFunc(input: string, option?: OptionType) {
  return slugify(option?.searchValue ?? '')
    .toLowerCase()
    .includes(slugify(input.toLowerCase()));
}

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

  const [
    reporters,
    handleSearchReporter,
    isSearchingReporters,
    selectedReporter,
    handleSelectedReporter,
  ] = useReporters();

  return (
    <Modal
      width={1000}
      closable={false}
      maskClosable={false}
      centered={true}
      closeIcon={null}
      destroyOnClose={true}
      open={isVisible}
      title={`Welcome ${user?.name}`}
      onOk={() => {
        dispatch(jiraSlice.actions.setIsVisible(false));
      }}
      onCancel={() => {
        dispatch(jiraSlice.actions.setIsVisible(false));
      }}>
      <Spin
        spinning={isLoadingProjects || isCheckingProject}
        tip={translate('general.loading')}>
        <Form form={form}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label={translate('project.title')}
                required={true}
                name="project">
                <Select
                  id="project"
                  showSearch={true}
                  filterOption={filterFunc}
                  placeholder={translate('project.searchPlaceholder')}
                  className="w-100"
                  loading={isLoadingProjects}
                  onChange={(projectId: string) => {
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
                                    'Bạn không được khai task vào dự án đã đóng',
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
                  }}
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
                            width={20}
                            height={20}
                          />
                        )}
                        <Tooltip title={project.name} className="mx-2">
                          <span>{project.key}</span>
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
                name="phase">
                <Select
                  disabled={!selectedProject}
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
                name="reporter">
                <Select
                  options={reporters.map((reporter) => (
                    <div
                      key={reporter.name}
                      dangerouslySetInnerHTML={{__html: reporter.html}}
                    />
                  ))}
                  showSearch={true}
                  loading={isSearchingReporters}
                  onSearch={handleSearchReporter}
                  onChange={handleSelectedReporter}
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
                name="typeOfWork">
                <Select
                  placeholder={translate('typeOfWork.searchPlaceholder')}
                  showSearch={true}
                  filterOption={filterFunc}
                  options={Object.values(TypeOfWork).map((type) => ({
                    value: type,
                    label: (
                      <div className="d-flex align-items-center">
                        {isGam(user) ? <div>🐸 </div> : null}
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
          <Form.Item label="Contents" required={true} name="contents">
            <Input.TextArea
              rows={10}
              placeholder={translate('tasks.addYourTaskHere')}
            />
          </Form.Item>
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
