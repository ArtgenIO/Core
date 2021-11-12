import { Button, Divider, Drawer, Form, Input, Select, Tooltip } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { camelCase, cloneDeep, snakeCase, upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useResetRecoilState } from 'recoil';
import { FieldType, IField, ISchema } from '../../../../../content/schema';
import { pageDrawerAtom } from '../../../../../management/backoffice/backoffice.atoms';

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

export default function SchemaEditorFieldTunerComponent({
  fieldKey: idx,
  schema,
  setSchema,
}: {
  fieldKey: number;
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  const resetPageDrawler = useResetRecoilState(pageDrawerAtom);
  const [form] = Form.useForm<IField>();
  const [refLinked, setRefLinked] = useState(true);
  const [clmLinked, setClmLinked] = useState(true);
  const [type, setType] = useState<FieldType>(null);
  const [visisble, setVisisble] = useState(true);

  if (idx === null || idx === undefined) {
    return <></>;
  }

  useEffect(() => {
    setType(schema.fields[idx].type);

    form.setFieldsValue(schema.fields[idx]);

    return () => {};
  }, [idx]);

  const updateSchema = () => {
    setSchema(current => {
      const update = cloneDeep(current);
      const currentField = update.fields[idx];
      const dv = form.getFieldValue('defaultValue');
      let values: string[] = form.getFieldValue(['typeParams', 'values']);
      const type = form.getFieldValue('type');

      if (type === FieldType.ENUM) {
        if (!values.length) {
          values = [''];
        }
      }

      const newField: IField = {
        reference: form.getFieldValue('reference'),
        label: form.getFieldValue('label'),
        columnName: form.getFieldValue('columnName'),
        defaultValue: dv === 'null' ? null : dv,
        type,
        typeParams: {
          ...currentField.typeParams,
          values,
        },
        tags: form.getFieldValue('tags'),
      };

      update.fields.splice(idx, 1, newField);

      return update;
    });

    if (form.getFieldValue('type') === FieldType.ENUM) {
      if (!form.getFieldValue(['typeParams', 'values']).length) {
        form.setFieldsValue({
          typeParams: {
            values: [''],
          },
        });
      }
    } else {
      form.setFieldsValue({
        typeParams: {
          values: [],
        },
      });
    }

    setType(form.getFieldValue('type'));
  };

  return (
    <ErrorBoundary>
      <Drawer
        width="420px"
        visible={visisble}
        onClose={() => resetPageDrawler()}
        title={null}
      >
        <Form
          form={form}
          name="naming"
          layout="vertical"
          requiredMark="optional"
          className="w-full"
          size="large"
          onValuesChange={changedValues => {
            const keys = Object.keys(changedValues);

            if (keys.includes('label')) {
              if (refLinked) {
                form.setFieldsValue({
                  reference: upperFirst(camelCase(changedValues['label'])),
                });
              }

              if (clmLinked) {
                form.setFieldsValue({
                  columnName: snakeCase(camelCase(changedValues['label'])),
                });
              }
            }
          }}
          onChange={e => {
            updateSchema();
          }}
        >
          <div className="flex -mt-2">
            <span className="material-icons-outlined text-3xl">view_week</span>
            &nbsp;
            <Form.Item
              className="mb-4"
              name="label"
              rules={[{ required: true, message: 'Please type a label!' }]}
            >
              <Input
                size="small"
                className="text-2xl pl-0"
                bordered={false}
                placeholder="Just a human friendly label"
              />
            </Form.Item>
          </div>
          <div className="px-4">
            <Form.Item
              className="mb-2"
              label="Reference"
              name="reference"
              rules={[{ required: true, message: 'Please type a reference!' }]}
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

            <Divider className="mb-2" />
            <Form.Item
              label="Default Value"
              name="defaultValue"
              className="mb-2"
            >
              <Input placeholder="Initial value" />
            </Form.Item>

            <Divider className="mb-2" />

            <Form.Item label="Data Type" name="type" className="mb-2">
              <Select className="w-64 mr-2" onChange={updateSchema}>
                <Select.Option key="boolean" value="boolean">
                  Boolean
                </Select.Option>
                <Select.Option key="timestamp" value="timestamp">
                  Timestamp
                </Select.Option>
                <Select.Option key="dateonly" value="dateonly">
                  Date Only
                </Select.Option>
                <Select.Option key="time" value="time">
                  Time
                </Select.Option>
                <Select.Option key="int" value="int">
                  Integer
                </Select.Option>
                <Select.Option key="json" value="json">
                  JSON
                </Select.Option>
                <Select.Option key="text" value="text">
                  Text
                </Select.Option>
                <Select.Option key="uuid" value="uuid">
                  UUID
                </Select.Option>
                <Select.Option key="string" value="string">
                  String
                </Select.Option>
                <Select.Option key="char" value="char">
                  Char
                </Select.Option>
                <Select.Option key="bigint" value="bigint">
                  Big Integer
                </Select.Option>
                <Select.Option key="tinyint" value="tinyint">
                  Tiny Integer
                </Select.Option>
                <Select.Option key="smallint" value="smallint">
                  Small Integer
                </Select.Option>
                <Select.Option key="mediumint" value="mediumint">
                  Medium Integer
                </Select.Option>
                <Select.Option key="float" value="float">
                  Floating Point
                </Select.Option>
                <Select.Option key="real" value="real">
                  Real Number
                </Select.Option>
                <Select.Option key="double" value="double">
                  Double Precision
                </Select.Option>
                <Select.Option key="decimal" value="decimal">
                  Decimal
                </Select.Option>
                <Select.Option key="blob" value="blob">
                  Binary
                </Select.Option>
                <Select.Option key="enum" value="enum">
                  Enumerator
                </Select.Option>
                <Select.Option key="hstore" value="hstore">
                  (PG) HStore
                </Select.Option>
                <Select.Option key="jsonb" value="jsonb">
                  (PG) JSON Binary
                </Select.Option>
                <Select.Option key="cidr" value="cidr">
                  (PG) CIDR
                </Select.Option>
                <Select.Option key="inet" value="inet">
                  (PG) INet
                </Select.Option>
                <Select.Option key="macaddr" value="macaddr">
                  (PG) Mac Address
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.List name={['typeParams', 'values']}>
              {(valueFields, { add, remove }) => {
                return (
                  <Form.Item
                    label="Enumerated Values"
                    className="mb-2"
                    hidden={!valueFields.length}
                  >
                    {valueFields.map(valueField => {
                      return (
                        <Form.Item {...valueField} className="mb-1">
                          <Input
                            placeholder="Type a value"
                            size="middle"
                            addonAfter={
                              <span
                                className="material-icons-outlined text-sm cursor-pointer"
                                onClick={() => remove(valueField.key)}
                              >
                                remove_circle_outline
                              </span>
                            }
                          />
                        </Form.Item>
                      );
                    })}

                    <Button
                      size="small"
                      ghost
                      block
                      type="dashed"
                      className="mt-2"
                      onClick={() => add('')}
                    >
                      <span className="material-icons-outlined">add</span>
                    </Button>
                  </Form.Item>
                );
              }}
            </Form.List>

            <Divider />

            <Form.Item label="Special Tags" name="tags" className="mb-2">
              <Select
                allowClear
                className="w-64 mr-2"
                placeholder="Type"
                onChange={updateSchema}
                mode="multiple"
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
                <Select.Option key="tags" value="tags">
                  Tag Engine
                </Select.Option>
                <Select.Option key="nullable" value="nullable">
                  Nullable
                </Select.Option>
                <Select.Option key="unique" value="unique">
                  Unique
                </Select.Option>
                <Select.Option key="indexed" value="indexed">
                  Indexed
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </ErrorBoundary>
  );
}
