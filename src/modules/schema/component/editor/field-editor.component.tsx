import { DeleteOutlined, FormOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  Select,
  Tooltip,
  Transfer,
} from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { TransferItem } from 'antd/lib/transfer';
import camelCase from 'lodash.camelcase';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { useEffect, useState } from 'react';
import { FieldType, IField, ISchema } from '../..';

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

type Props = {
  isNewSchema: boolean;
  immutableSchema: ISchema;
  immutableField: IField;
  onClose: (newState: IField | null) => void;
};

export default function FieldEditor({
  onClose,
  immutableField,
  isNewSchema,
  immutableSchema,
}: Props) {
  const [field, setField] = useState<IField>(null);

  // Auto generate ref and table for new schema
  const [refLinked, setRefLinked] = useState(true);
  const [clmLinked, setClmLinked] = useState(true);
  const [refReadOnly, setRefReadOnly] = useState(true);

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {}, [isNewSchema]);

  useEffect(() => {
    const isExistingField = immutableSchema.fields.some(
      f => f.reference == immutableField.reference,
    );
    const isRefReadOnly = isNewSchema ? false : isExistingField;

    console.log('isNewSchema', isNewSchema);
    console.log('isExistingField', isExistingField);
    console.log('isRefReadOnly', isRefReadOnly);

    setField(immutableField);
    setRefReadOnly(isRefReadOnly);
  }, [immutableField]);

  useEffect(() => {
    if (field && immutableField) {
      setIsChanged(!isEqual(field, immutableField));
    }
  }, [field]);

  const setters: TransferItem[] = [
    {
      title: 'Base64 Encode',
      key: 'base64Encode',
      description: 'Encodes the value into base64 format',
    },
    {
      title: 'Hexadecimal Encode',
      key: 'base16Encode',
      description: 'Encodes the value into base16 format',
    },
    {
      title: 'Password Hasher',
      key: 'password',
      description: 'BCrpyt comparable hash, useful for passwords!',
    },
  ];

  const getters: TransferItem[] = [
    {
      title: 'Base64 Decode',
      key: 'base64Decode',
      description: 'Decodes the value from base64 format',
    },
    {
      title: 'Hexadecimal Decode',
      key: 'base16Decode',
      description: 'Decodes the value from base16 format',
    },
  ];

  return (
    <ErrorBoundary>
      {field && (
        <Drawer
          width="30%"
          visible
          onClose={() => onClose(field)}
          title={
            <div className="flex w-full">
              <div className="grow">Field » {immutableField.title}</div>
              <div className="shrink">
                {isChanged && (
                  <div className="-mt-1">
                    <Button
                      className="text-yellow-500 border-yellow-500 hover:text-yellow-200 hover:border-yellow-200"
                      block
                      icon={<SaveOutlined />}
                      onClick={() => setField(immutableField)}
                    >
                      Restore Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          }
        >
          <Form
            layout="vertical"
            requiredMark={false}
            className="w-full px-4"
            size="small"
          >
            <Form.Item className="mb-4" label="Title">
              <Input
                size="large"
                className="text-2xl pl-0"
                bordered={false}
                placeholder="Just a human friendly title"
                suffix={<FormOutlined />}
                value={field.title}
                onChange={e => {
                  setField(oldState =>
                    Object.assign(cloneDeep(oldState), {
                      title: e.target.value,
                      columnName: clmLinked
                        ? camelCase(e.target.value)
                        : oldState.columnName,
                      reference: refLinked
                        ? camelCase(e.target.value)
                        : oldState.reference,
                    } as Pick<IField, 'title' | 'reference' | 'columnName'>),
                  );
                }}
              />
            </Form.Item>
            <Form.Item className="mb-2" label="Reference">
              <Input
                placeholder="System inner reference, used as a unique identifier per database"
                disabled={refReadOnly}
                value={field.reference}
                suffix={
                  !refReadOnly && (
                    <InputLinked
                      isLinked={refLinked}
                      setIsLinked={setRefLinked}
                    />
                  )
                }
                onChange={e => {
                  setField(oldState =>
                    Object.assign(cloneDeep(oldState), {
                      reference: e.target.value,
                    } as Pick<IField, 'reference'>),
                  );
                }}
              />
            </Form.Item>

            <Form.Item
              label="Column Name"
              className="mb-2"
              rules={[
                { required: true, message: 'Please type a column name!' },
              ]}
            >
              <Input
                placeholder="The column's name created in the database table"
                disabled={refReadOnly}
                value={field.columnName}
                suffix={
                  !refReadOnly && (
                    <InputLinked
                      isLinked={clmLinked}
                      setIsLinked={setClmLinked}
                    />
                  )
                }
                onChange={e => {
                  setField(oldState =>
                    Object.assign(cloneDeep(oldState), {
                      columnName: e.target.value,
                    } as Pick<IField, 'columnName'>),
                  );
                }}
              />
            </Form.Item>

            <Form.Item label="Default Value" className="mb-2">
              <Input
                placeholder="Initial value"
                onChange={e => {
                  setField(oldState =>
                    Object.assign(cloneDeep(oldState), {
                      defaultValue:
                        e.target.value === 'null' ? null : e.target.value,
                    } as Pick<IField, 'defaultValue'>),
                  );
                }}
              />
            </Form.Item>

            <Form.Item label="Data Type" className="mb-2">
              <Select
                className="w-64 mr-2"
                value={field.type}
                onChange={newType => {
                  setField(oldState => {
                    // Set the new type
                    const extension = {
                      type: newType,
                    } as Partial<Pick<IField, 'type' | 'args'>>;

                    // Extend with enum values
                    if (newType === FieldType.ENUM) {
                      extension.args = {
                        values: ['Yes', 'No', 'Maybe'],
                      };
                    }

                    const newField = Object.assign(
                      cloneDeep(oldState),
                      extension,
                    );

                    // Old type was enum, remove values
                    if (field.type === FieldType.ENUM) {
                      delete newField.args.values;
                    }

                    return newField;
                  });
                }}
                showSearch
              >
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

            <div>
              {field.type === FieldType.ENUM && (
                <>
                  {field.args.values.map((v, i) => (
                    <div className="flex" key={`enumv-${i}`}>
                      <Input
                        key={`enum-${i}`}
                        value={v}
                        onChange={e =>
                          setField(oldState => {
                            const newState = cloneDeep(oldState);
                            newState.args.values.splice(i, 1, e.target.value);
                            return newState;
                          })
                        }
                        className="grow"
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        className="shrink rounded-r-none"
                        onClick={() =>
                          setField(oldState => {
                            const newState = cloneDeep(oldState);
                            newState.args.values.splice(i, 1);
                            return newState;
                          })
                        }
                      ></Button>
                    </div>
                  ))}
                  <Button
                    size="small"
                    ghost
                    block
                    type="dashed"
                    className="mt-2 rounded-l-none"
                    onClick={() =>
                      setField(oldState => {
                        const newState = cloneDeep(oldState);
                        newState.args.values.push('');
                        return newState;
                      })
                    }
                  >
                    <span className="material-icons-outlined">add</span>
                  </Button>
                </>
              )}
            </div>

            <Form.Item label="Special Tags" className="mb-2">
              <Select
                allowClear
                className="w-64 mr-2"
                placeholder="Type"
                onChange={tags => {
                  setField(oldState =>
                    Object.assign(cloneDeep(oldState), {
                      tags,
                    } as Pick<IField, 'tags'>),
                  );
                }}
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

            <Divider />
            <h2 className="font-header">
              On <span className="text-primary-500">Set</span> Transformers
            </h2>
            <Transfer
              dataSource={setters}
              render={item => item.title}
            ></Transfer>

            <Divider />
            <h2 className="font-header">
              On <span className="text-primary-500">Get</span> Transformers
            </h2>
            <Transfer
              dataSource={getters}
              render={item => item.title}
            ></Transfer>
          </Form>
        </Drawer>
      )}
    </ErrorBoundary>
  );
}