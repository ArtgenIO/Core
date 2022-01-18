import { Form, Input, Tooltip } from 'antd';
import { camelCase, cloneDeep, snakeCase } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
          : 'Input is independent from the title name'
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

export default function SchemaEditorNamingComponent({
  isNewSchema,
  schema,
  setSchema,
}: {
  isNewSchema: boolean;
  schema: Partial<ISchema>;
  setSchema: Dispatch<SetStateAction<Partial<ISchema>>>;
}) {
  const [form] = Form.useForm();

  const [refLinked, setRefLinked] = useState(true);
  const [tblLinked, setTblLinked] = useState(true);

  useEffect(() => {
    setRefLinked(isNewSchema);
    setTblLinked(isNewSchema);
  }, [isNewSchema]);

  return (
    <>
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

          if (keys.includes('title')) {
            if (refLinked) {
              form.setFieldsValue({
                reference: camelCase(changedValues['title']),
              });
            }

            if (tblLinked) {
              form.setFieldsValue({
                tableName: snakeCase(changedValues['title']),
              });
            }
          }
        }}
        onChange={e => {
          setSchema(current => {
            const update = cloneDeep(current);

            update.title = form.getFieldValue('title');
            update.reference = form.getFieldValue('reference');
            update.tableName = form.getFieldValue('tableName');

            return update;
          });
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please type a title!' }]}
        >
          <Input placeholder="Just a human friendly title, like Products" />
        </Form.Item>

        <Form.Item
          label="Reference"
          name="reference"
          rules={[{ required: true, message: 'Please type a reference!' }]}
        >
          <Input
            placeholder="System inner reference, used as a unique identifier per database"
            disabled={!isNewSchema}
            suffix={
              isNewSchema ? (
                <InputLinked isLinked={refLinked} setIsLinked={setRefLinked} />
              ) : undefined
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
            disabled={!isNewSchema}
            suffix={
              isNewSchema ? (
                <InputLinked isLinked={tblLinked} setIsLinked={setTblLinked} />
              ) : undefined
            }
          />
        </Form.Item>
      </Form>
    </>
  );
}
