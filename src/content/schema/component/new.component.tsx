import { TableOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Select } from 'antd';
import { useHistory } from 'react-router';
import { useSetRecoilState } from 'recoil';
import { ISchema } from '..';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClientOld } from '../../../management/backoffice/library/http-client';
import { FieldTag } from '../interface/field-tags.enum';
import { FieldType } from '../interface/field-type.enum';
import { schemasAtom } from '../schema.atoms';

type FormValues = {
  reference: string;
  label: string;
  tableName: string;
  database: string;
  capabilities: string[];
};

export default function NewSchemaComponent() {
  const history = useHistory();
  const httpClient = useHttpClientOld();
  const setSchemas = useSetRecoilState(schemasAtom);

  const doCreateSchema = async (formValues: FormValues) => {
    const data: ISchema = {
      reference: formValues.reference,
      database: formValues.database,
      tableName: formValues.tableName,
      label: formValues.label,
      fields: [],
      indices: [],
      uniques: [],
      relations: [],
      icon: 'table',
      permission: 'rw',
      version: 2,
      tags: ['active'],
    };

    const cap = formValues.capabilities;

    if (cap.includes('id')) {
      data.fields.unshift({
        reference: 'id',
        columnName: 'id',
        label: 'Identifier',
        tags: [FieldTag.PRIMARY],
        type: FieldType.UUID,
        typeParams: { values: [] },
      });
    }

    if (cap.includes('created')) {
      data.fields.push({
        reference: 'createdAt',
        columnName: 'createdAt',
        label: 'Created At',
        tags: [FieldTag.CREATED],
        type: FieldType.DATETIME,
        typeParams: { values: [] },
      });
    }

    if (cap.includes('updated')) {
      data.fields.push({
        reference: 'updatedAt',
        columnName: 'updatedAt',
        label: 'Last Updated At',
        tags: [FieldTag.UPDATED],
        type: FieldType.DATETIME,
        typeParams: { values: [] },
      });
    }

    if (cap.includes('deleted')) {
      data.fields.push({
        reference: 'deletedAt',
        columnName: 'deletedAt',
        label: 'Deleted At',
        tags: [FieldTag.DELETED],
        type: FieldType.DATETIME,
        defaultValue: null,
        typeParams: { values: [] },
      });
    }

    if (cap.includes('version')) {
      data.fields.push({
        reference: 'version',
        columnName: 'version',
        label: 'Version Lock',
        tags: [FieldTag.VERSION],
        type: FieldType.INTEGER,
        defaultValue: 1,
        typeParams: { values: [] },
      });
    }

    const response = await httpClient.post<ISchema>(
      '/api/$system/content/schema',
      data,
    );

    return response.data;
  };

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Create New Schema"
          avatar={{
            icon: <TableOutlined />,
          }}
        />
      }
    >
      <div className="content-box px-24 py-12 w-2/3 mx-auto">
        <Form
          name="workflow"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ capabilities: ['id', 'created'] }}
          onFinish={(formValues: FormValues) => {
            doCreateSchema(formValues)
              .then(record => {
                setSchemas(curr => curr.concat(record));
                history.push(
                  `/backoffice/content/schema/${record.database}/${record.reference}`,
                );
                message.success('Schema is ready!');
              })
              .catch(e => message.error(e.message));
          }}
          onFinishFailed={() => message.error('Failed to validate')}
        >
          <Form.Item label="Label" name="label">
            <Input />
          </Form.Item>

          <Form.Item label="Reference" name="reference">
            <Input />
          </Form.Item>

          <Form.Item label="Table Name" name="tableName">
            <Input />
          </Form.Item>

          <Form.Item label="Database ID" name="database">
            <Input />
          </Form.Item>

          <Form.Item label="Capabilities" name="capabilities">
            <Select mode="multiple" allowClear placeholder="Capabilities">
              <Select.Option key="id" value="id">
                Identifiable
              </Select.Option>
              <Select.Option key="created" value="created">
                Creation Date
              </Select.Option>
              <Select.Option key="updated" value="updated">
                Last Update Date
              </Select.Option>
              <Select.Option key="deleted" value="deleted">
                Soft Deleting
              </Select.Option>
              <Select.Option key="version" value="version">
                Version Locking
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" block htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </div>
    </PageWithHeader>
  );
}
