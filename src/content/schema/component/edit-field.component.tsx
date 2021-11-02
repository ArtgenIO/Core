import {
  DatabaseOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  RightOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Input, List, Popconfirm, Select } from 'antd';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { IField } from '..';
import { FieldTag } from '../interface/field-tags.enum';
import { schemaAtom } from '../schema.atoms';
import './edit-field.component.less';

type Props = {
  idx: number;
  field: IField;
};

export default function SchenaEditFieldComponent({ field, idx }: Props) {
  const setSchema = useSetRecoilState(schemaAtom);

  const [label, setLabel] = useState(field.label);
  const [columnName, setColumnName] = useState(field.columnName);
  const [reference, setReference] = useState(field.reference);
  const [type, setType] = useState(field.type);
  const [tags, setTags] = useState(field.tags);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  useEffect(() => {
    setIsPrimary(field.tags.includes(FieldTag.PRIMARY));
    setIsUnique(field.tags.includes(FieldTag.UNIQUE));
    setIsIndexed(field.tags.includes(FieldTag.INDEX));

    return () => {};
  }, [field.tags]);

  const deleteField = () => {
    setSchema(currentSchema => {
      const newSchema = cloneDeep(currentSchema);
      newSchema.fields = newSchema.fields.filter((f, fidx) => fidx !== idx);

      return newSchema;
    });
  };

  const updateField = () => {
    setSchema(currentSchema => {
      const newSchema = cloneDeep(currentSchema);

      newSchema.fields[idx] = {
        label,
        columnName,
        reference,
        type,
        tags,
      };

      return newSchema;
    });
  };

  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          <Avatar
            shape="square"
            size="large"
            className="bg-dark"
            icon={<RightOutlined />}
          />
        }
        title={
          <Input
            placeholder="Label"
            bordered={false}
            defaultValue={label}
            onChange={event => setLabel(event.target.value)}
            onBlur={updateField}
            className="text-lg"
          ></Input>
        }
        description={
          <>
            <Input
              size="small"
              placeholder="Database Name"
              prefix={<DatabaseOutlined />}
              defaultValue={field.columnName}
              bordered={false}
              className="w-48"
              onChange={event => setColumnName(event.target.value)}
              onBlur={updateField}
            />
            <Input
              size="small"
              placeholder="Reference"
              prefix={<SelectOutlined />}
              defaultValue={field.reference}
              bordered={false}
              className="w-48"
              onChange={event => setReference(event.target.value)}
              onBlur={updateField}
            />
          </>
        }
      />

      <div className={'edit-icon primary ' + (isPrimary ? 'active' : '')}></div>
      <div className={'edit-icon index ' + (isIndexed ? 'active' : '')}></div>
      <div
        className={'edit-icon unique mr-2 ' + (isUnique ? 'active' : '')}
      ></div>

      <Select
        className="w-32 mr-2"
        placeholder="Type"
        defaultValue={field.type}
        onChange={newType => setType(newType)}
        onBlur={updateField}
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

      <Select
        className="w-64 mr-2"
        mode="multiple"
        allowClear
        placeholder="Tags"
        defaultValue={field.tags}
        onChange={newTags => setTags(newTags)}
        onBlur={updateField}
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
        <Select.Option key="nullable" value="nullable">
          Nullable
        </Select.Option>
        <Select.Option key="index" value="index">
          Indexed
        </Select.Option>
        <Select.Option key="unique" value="unique">
          Unique
        </Select.Option>
      </Select>

      <Popconfirm
        title="Are You sure to delete this column?"
        okText="Yes, delete"
        cancelText="No"
        placement="left"
        onConfirm={deleteField}
        icon={<QuestionCircleOutlined />}
      >
        <Button
          icon={<DeleteOutlined />}
          className="rounded-md hover:text-red-500 hover:border-red-500"
        ></Button>
      </Popconfirm>
    </List.Item>
  );
}
