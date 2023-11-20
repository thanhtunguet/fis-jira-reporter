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
  const {user} = useSelector((state: GlobalState) => state.user);

  const {isVisible} = useSelector((state: GlobalState) => state.jira);

  const dispatch = useDispatch();

  const [projects, isLoadingProjects] = useProjects();

  const [form] = Form.useForm<JiraForm>();

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
      <Spin spinning={isLoadingProjects} tip="Loading">
        <Form form={form}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label="Project"
                required={true}
                name="project">
                <Select
                  id="project"
                  showSearch={true}
                  filterOption={filterFunc}
                  placeholder="Select a project, type to search"
                  className="w-100"
                  loading={isLoadingProjects}
                  onChange={() => {
                    form.setFields([
                      {
                        name: 'project',
                        errors: ['error'],
                      },
                    ]);
                  }}
                  options={projects.map((project) => ({
                    value: project.id,
                    searchValue: project.key,
                    label: (
                      <div className="d-inline-flex align-items-center">
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
                        <span className="mx-2">{project.key}</span>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label="Component"
                required={true}
                name="component">
                <Select placeholder="Select your project component, type to search" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label="Phase"
                required={true}
                name="phase">
                <Select placeholder="Select your project phase" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label="Reporter"
                required={true}
                name="reporter">
                <Select placeholder="Select your reporter" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                {...formItemProps}
                label="Type of Work"
                required={true}
                name="typeOfWork">
                <Select
                  placeholder="Select your project phase"
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
          <Form.Item label="Contents" required={true} name="reporter">
            <Input.TextArea rows={10} placeholder="Select your reporter" />
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
