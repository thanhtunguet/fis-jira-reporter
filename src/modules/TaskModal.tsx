import type {FC} from 'react';
import React from 'react';
import type {ModalTemplateProps} from 'src/components/ModalTemplate';
import ModalTemplate from 'src/components/ModalTemplate';
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

const formItemProps: FormItemProps = {
  className: 'px-4',
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

const TaskModal: FC<TaskModalProps> = (props): JSX.Element => {
  const {
    children,
    ...restProps
    //
  } = props;

  const {user} = useSelector((state: GlobalState) => state.user);

  const dispatch = useDispatch();

  const [projects, isLoadingProjects] = useProjects();

  const [form] = Form.useForm<JiraForm>();

  return (
    <ModalTemplate
      {...restProps}
      size="sm"
      title={`Welcome ${user?.name}`}
      onOk={() => {
        dispatch(jiraSlice.actions.setIsVisible(false));
      }}
      onCancel={() => {
        dispatch(jiraSlice.actions.setIsVisible(false));
      }}>
      <></>
      {children}
      <Spin spinning={isLoadingProjects} tip="Loading">
        <Form form={form}>
          <Row>
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
              <Form.Item label="Component" required={true} name="component">
                <Select placeholder="Select your project component" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </ModalTemplate>
  );
};

export interface TaskModalProps extends ModalTemplateProps {
  //
}

TaskModal.defaultProps = {};

export default TaskModal;
