import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Form,
  Input,
  Select,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { camelCase, cloneDeep, snakeCase, upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { IField, ISchema } from '../..';

type CustomFieldProp = {
  field: IField;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
};

type InputLinkedProps = {
  isLinked: boolean;
  setIsLinked: (s: (c: boolean) => boolean) => void;
};

function InputLinked({ isLinked, setIsLinked }: InputLinkedProps) {
  return (
    <Tooltip
      placement="topRight"
      title={
        isLinked
          ? 'Click to edit independently'
          : 'Input is independent from the label name'
      }
    >
      <span
        className="material-icons cursor-pointer"
        onClick={() => setIsLinked(c => !c)}
      >
        {isLinked ? 'insert_link' : 'link_off'}
      </span>
    </Tooltip>
  );
}

function CustomField({ field, setSchema }: CustomFieldProp) {
  const [form] = Form.useForm();

  const [refLinked, setRefLinked] = useState(true);
  const [clmLinked, setClmLinked] = useState(true);

  return (
    <div className="mb-4 bg-dark rounded-md gray-border">
      <div className="flex flex-row flex-nowrap">
        <div
          className="flex-shrink rounded-tl-md rounded-bl-md"
          style={{ backgroundColor: '#37393f' }}
        >
          <div
            className="w-8 text-center"
            style={{ borderBottom: '1px solid #333' }}
          >
            <span
              className="material-icons-outlined"
              style={{ lineHeight: '134px' }}
            >
              north
            </span>
          </div>

          <div className="w-8 text-center">
            <span
              className="material-icons-outlined"
              style={{ lineHeight: '134px' }}
            >
              south
            </span>
          </div>
        </div>

        <Tabs
          defaultActiveKey="1"
          tabPosition="bottom"
          size="small"
          type="line"
          className="w-full"
          tabBarExtraContent={{
            right: (
              <Button size="small" className="mr-8" danger>
                Delete <DeleteOutlined />
              </Button>
            ),
          }}
          tabBarStyle={{ paddingLeft: '32px' }}
        >
          <Tabs.TabPane key="general" tab="General Config">
            <div className="flex flex-row flex-nowrap flex-grow">
              <div className="flex pt-3 pl-2">
                <span className="material-icons-outlined bg-light-dark text-7xl text-center align-middle pt-3 rounded-md h-24 w-24 m-2">
                  view_week
                </span>
              </div>

              <div className="flex pl-2 py-4 w-96">
                <Form
                  form={form}
                  name="naming"
                  layout="vertical"
                  initialValues={field}
                  requiredMark="optional"
                  className="w-full"
                  size="small"
                  onValuesChange={changedValues => {
                    const keys = Object.keys(changedValues);

                    if (keys.includes('label')) {
                      if (refLinked) {
                        form.setFieldsValue({
                          reference: upperFirst(
                            camelCase(changedValues['label']),
                          ),
                        });
                      }

                      if (clmLinked) {
                        form.setFieldsValue({
                          tableName: snakeCase(
                            camelCase(changedValues['label']),
                          ),
                        });
                      }
                    }
                  }}
                  onChange={e => {
                    setSchema(current => {
                      const update = cloneDeep(current);

                      update.label = form.getFieldValue('label');
                      update.reference = form.getFieldValue('reference');
                      update.tableName = form.getFieldValue('tableName');

                      return update;
                    });
                  }}
                >
                  <Form.Item
                    className="mb-4"
                    name="label"
                    rules={[
                      { required: true, message: 'Please type a label!' },
                    ]}
                  >
                    <Input
                      size="small"
                      className="text-2xl pl-0"
                      bordered={false}
                      placeholder="Just a human friendly label"
                    />
                  </Form.Item>

                  <Form.Item
                    className="mb-2"
                    label="Reference"
                    name="reference"
                    rules={[
                      { required: true, message: 'Please type a reference!' },
                    ]}
                  >
                    <Input
                      placeholder="System inner reference, used as a unique identifier per database"
                      disabled={refLinked}
                      suffix={
                        <InputLinked
                          isLinked={refLinked}
                          setIsLinked={setRefLinked}
                        />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Column Name"
                    name="columnName"
                    className="mb-2"
                    rules={[
                      { required: true, message: 'Please type a column name!' },
                    ]}
                  >
                    <Input
                      className="mb-2"
                      placeholder="The table's name created in the database server"
                      disabled={clmLinked}
                      suffix={
                        <InputLinked
                          isLinked={clmLinked}
                          setIsLinked={setClmLinked}
                        />
                      }
                    />
                  </Form.Item>
                </Form>
              </div>

              <div
                className="flex-shrink ml-4 pl-4 my-4"
                style={{ borderLeft: '1px solid #363636' }}
              >
                <div className="mb-2 text-lg">Data Type:</div>
                <Select
                  className="w-64 mr-2"
                  placeholder="Type"
                  defaultValue={field.type}
                >
                  <Select.Option key="uuid" value="uuid">
                    UUID
                  </Select.Option>
                  <Select.Option key="text" value="text">
                    Text
                  </Select.Option>
                  <Select.Option key="json" value="json">
                    JSON
                  </Select.Option>
                  <Select.Option key="int" value="int">
                    Integer
                  </Select.Option>
                  <Select.Option key="boolean" value="boolean">
                    Boolean
                  </Select.Option>
                </Select>

                <div className="mb-2 mt-2 text-lg">Data Length:</div>
                <Input placeholder="Not available" disabled />
              </div>

              <div
                className="flex-shrink ml-4 pl-4 my-4"
                style={{ borderLeft: '1px solid #363636' }}
              >
                <div className="mb-2 text-lg">Behavior:</div>

                <Select
                  className="w-64 mr-2"
                  placeholder="Type"
                  defaultValue={'primary'}
                >
                  <Select.Option key="primary" value="primary">
                    Primary
                  </Select.Option>
                  <Select.Option key="created" value="created">
                    Created
                  </Select.Option>
                  <Select.Option key="updated" value="updated">
                    Updated
                  </Select.Option>
                  <Select.Option key="deleted" value="deleted">
                    Deleted
                  </Select.Option>
                  <Select.Option key="version" value="version">
                    Version
                  </Select.Option>
                  <Select.Option key="version" value="tags">
                    Tag Engine
                  </Select.Option>
                </Select>
              </div>
              <div className="flex-grow text-right pr-4 pt-4">
                <div className="h-10">
                  <span className="material-icons-outlined">key</span>
                </div>

                <div className="h-10">
                  <span className="material-icons-outlined">ac_unit</span>
                </div>

                <div className="h-10">
                  <span className="material-icons-outlined">bolt</span>
                </div>

                <div className="h-10">
                  <span className="material-icons-outlined">
                    comments_disabled
                  </span>
                </div>
              </div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="2" tab="Interfaces">
            Choose editor interface
          </Tabs.TabPane>
          <Tabs.TabPane key="3" tab="Content Rules">
            Validation, nullable, required,
          </Tabs.TabPane>
          <Tabs.TabPane key="4" tab="Accessors">
            Accessors
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default function CustomFieldsComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  return (
    <>
      <Typography className="mb-8">
        <Typography.Title>Custom Fields</Typography.Title>
        <Divider />
        <Typography.Paragraph>
          Here You can customize the additional data fields, those will be
          translated as table columns for your chosen database. At first it can
          be overwhelming to plan for every scenario, but worry not, you can
          edit everything even after creation. Consider using a least minimum
          approach where you only add fields what you know will definitely need,
          and you can add more of those as the need arises.
        </Typography.Paragraph>
      </Typography>

      <div>
        {schema.fields.map((field, k) => (
          <CustomField setSchema={setSchema} key={k} field={field} />
        ))}
      </div>
    </>
  );
}
