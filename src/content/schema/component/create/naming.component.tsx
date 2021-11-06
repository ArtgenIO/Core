import { Divider, Form, Input, Tooltip, Typography } from 'antd';
import { camelCase, cloneDeep, snakeCase, upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { ISchema } from '../..';

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

export default function NamingComponent({
  schema,
  setSchema,
}: {
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  const [form] = Form.useForm();

  const [refLinked, setRefLinked] = useState(true);
  const [tblLinked, setTblLinked] = useState(true);

  return (
    <>
      <Typography>
        <Typography.Title>Name Your Data Schema</Typography.Title>
        <Divider />
        <Typography.Paragraph>
          Choose which database you want to create the schema to. Please be
          aware that different database providers come with different
          capabilities, for example PostgreSQL provides native UUID type, but
          SQLite does not. If you want to use a new database for this schema
          click to the add new database at the right top corner.
        </Typography.Paragraph>
      </Typography>

      <Form
        form={form}
        name="naming"
        layout="vertical"
        initialValues={schema}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        requiredMark="optional"
        size="large"
        onValuesChange={changedValues => {
          const keys = Object.keys(changedValues);

          if (keys.includes('label')) {
            if (refLinked) {
              form.setFieldsValue({
                reference: upperFirst(camelCase(changedValues['label'])),
              });
            }

            if (tblLinked) {
              form.setFieldsValue({
                tableName: snakeCase(camelCase(changedValues['label'])),
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
          label="Label"
          name="label"
          rules={[{ required: true, message: 'Please type a label!' }]}
        >
          <Input placeholder="Just a human friendly label, like Products" />
        </Form.Item>

        <Form.Item
          label="Reference"
          name="reference"
          rules={[{ required: true, message: 'Please type a reference!' }]}
        >
          <Input
            placeholder="System inner reference, used as a unique identifier per database"
            disabled={refLinked}
            suffix={
              <InputLinked isLinked={refLinked} setIsLinked={setRefLinked} />
            }
          />
        </Form.Item>

        <Form.Item
          label="Table Name"
          name="tableName"
          rules={[{ required: true, message: 'Please type a table name!' }]}
        >
          <Input
            className="mb-12"
            placeholder="The table's name created in the database server"
            disabled={tblLinked}
            suffix={
              <InputLinked isLinked={tblLinked} setIsLinked={setTblLinked} />
            }
          />
        </Form.Item>
      </Form>
    </>
  );
}
