import { Button, Divider, Drawer, Form, Input, Select, Tooltip } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { camelCase, cloneDeep, snakeCase } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FieldTag, FieldType, IField, ISchema } from '../../../../schema';

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
  onClose,
}: {
  fieldKey: number;
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
  onClose: Dispatch<SetStateAction<number>>;
}) {
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

    const fClone = cloneDeep(schema.fields[idx]);

    if (fClone.defaultValue === null) {
      fClone.defaultValue = 'null';
    }

    form.setFieldsValue(fClone);

    return () => {};
  }, [idx]);

  const updateSchema = () => {
    setSchema(current => {
      const update = cloneDeep(current);
      const currentField = update.fields[idx];
      const dv = form.getFieldValue('defaultValue');
      let values: string[] = form.getFieldValue(['args', 'values']);
      const type = form.getFieldValue('type');

      if (type === FieldType.ENUM) {
        if (!values.length) {
          values = [''];
        }
      }

      const newField: IField = {
        reference: form.getFieldValue('reference'),
        title: form.getFieldValue('title'),
        columnName: form.getFieldValue('columnName'),
        type,
        meta: {},
        args: {
          ...currentField.args,
          values,
        },
        tags: form.getFieldValue('tags'),
      };

      if (dv === 'null') {
        newField.defaultValue = null;

        if (!newField.tags.includes(FieldTag.NULLABLE)) {
          newField.tags.push(FieldTag.NULLABLE);
        }
      } else if (dv !== null) {
        newField.defaultValue = dv;
      }

      update.fields.splice(idx, 1, newField);

      return update;
    });

    if (form.getFieldValue('type') === FieldType.ENUM) {
      if (!form.getFieldValue(['args', 'values']).length) {
        form.setFieldsValue({
          args: {
            values: [''],
          },
        });
      }
    } else {
    }

    setType(form.getFieldValue('type'));
  };

  return (
    <ErrorBoundary>
      <Drawer
        width="30%"
        visible={visisble}
        onClose={() => onClose(null)}
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

            if (keys.includes('title')) {
              if (refLinked) {
                form.setFieldsValue({
                  reference: camelCase(changedValues['title']),
                });
              }

              if (clmLinked) {
                form.setFieldsValue({
                  columnName: snakeCase(changedValues['title']),
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
              name="title"
              rules={[{ required: true, message: 'Please type a title!' }]}
            >
              <Input
                size="small"
                className="text-2xl pl-0"
                bordered={false}
                placeholder="Just a human friendly title"
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

            <Form.List name={['args', 'values']}>
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
