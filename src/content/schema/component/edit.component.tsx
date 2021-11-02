import { EditOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Input, List, notification, Tabs } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { cloneDeep } from 'lodash';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ISchema } from '..';
import { breadcrumbsAtom } from '../../../management/backoffice/backoffice.atoms';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClient } from '../../../management/backoffice/library/http-client';
import { FieldType } from '../interface/field-type.enum';
import { schemaAtom, schemasAtom } from '../schema.atoms';
import SchenaEditFieldComponent from './edit-field.component';

type SchemaRow = {
  id: string;
  reference: string;
  schema: ISchema;
  tags: string[];
};

export default function SchemaEditorComponent() {
  const params = useParams<{ id: string }>();
  const [schemas, setSchemas] = useRecoilState(schemasAtom);
  const [record, setRecord] = useRecoilState<ISchema>(schemaAtom);
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const [generalForm] = useForm();
  const httpClient = useHttpClient();

  const addNewField = () => {
    setRecord(currentState => {
      const newState = cloneDeep(currentState);
      const fieldKeys = newState.fields.map(f => f.reference);
      let fieldKey = 0;

      while (++fieldKey) {
        if (!fieldKeys.includes(`newField${fieldKey}`)) {
          break;
        }
      }

      newState.fields.push({
        reference: `newField${fieldKey}`,
        columnName: `newField${fieldKey}`,
        label: `New Field ${fieldKey}`,
        tags: [],
        type: FieldType.TEXT,
        defaultValue: null,
      });

      return newState;
    });
  };

  useEffect(() => {
    if (schemas.length) {
      const current = schemas.find(record => record.id == params.id);

      setRecord(current);
      setBreadcrumb(routes =>
        routes.concat({
          breadcrumbName: current.label,
          path: `${current.id}/edit`,
        }),
      );
    }

    return () => {
      setBreadcrumb(routes => routes.slice(0, routes.length - 1));
    };
  }, [schemas]);

  const SaveChanges = () => {
    console.log('Sending', record);

    httpClient
      .patch(`/api/$system/content/schema/${record.id}`, record)
      .then(response => {
        notification.success({
          key: 'schema-save',
          message: 'Changes saved',
          placement: 'bottomRight',
        });
      })
      .catch(() => {
        notification.success({
          key: 'schema-save',
          message: 'Errr, internal error!',
          placement: 'bottomRight',
        });
      });
  };

  const onGeneralFormChange = () => {
    setSchemas(currentRecords => {
      const newRecords: ISchema[] = [];

      for (const curr of currentRecords) {
        if (curr.id === params.id) {
          const newRecord: ISchema = cloneDeep(curr);

          newRecord.label = generalForm.getFieldValue('label');
          newRecord.tableName = generalForm.getFieldValue('dbName');

          newRecords.push(newRecord);

          setRecord(newRecord);
        } else {
          newRecords.push(curr);
        }
      }

      return newRecords;
    });
  };

  if (!record) {
    return <></>;
  }

  return (
    <PageWithHeader
      header={
        <PageHeader
          title={record ? `Change [${record.label}] Schema` : 'Loading'}
          avatar={{
            icon: <EditOutlined />,
          }}
          actions={
            <Button
              key="create"
              onClick={() => {
                SaveChanges();
              }}
              type="primary"
              icon={<FileAddOutlined />}
            >
              Apply Changes
            </Button>
          }
        />
      }
    >
      {!!record ? (
        <div>
          <Tabs
            tabPosition="left"
            defaultActiveKey="fields"
            size="large"
            style={{ minHeight: 320 }}
          >
            <Tabs.TabPane tab="General" key="table">
              <div className="content-box pt-6">
                <Form
                  form={generalForm}
                  name="general"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 12 }}
                  initialValues={{
                    reference: record.reference,
                    label: record.label,
                    dbName: record.tableName,
                  }}
                  onBlur={event => onGeneralFormChange()}
                >
                  <Form.Item label="Reference" name="reference">
                    <Input readOnly disabled />
                  </Form.Item>

                  <Form.Item
                    label="Label"
                    name="label"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Table Name"
                    name="dbName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Form>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Fields" key="fields">
              <List
                size="large"
                bordered
                dataSource={record.fields}
                renderItem={(field, idx) => (
                  <SchenaEditFieldComponent
                    field={field}
                    idx={idx}
                    key={field.reference}
                  />
                )}
              >
                <List.Item
                  key="add-column"
                  className="cursor-pointer content-box"
                  onClick={addNewField}
                >
                  <div className="text-center w-full border-dashed br-light-dark hover:border-gray-600">
                    <PlusOutlined className="text-xl" />
                  </div>
                </List.Item>
              </List>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Indexes" key="indexes">
              Indexes
            </Tabs.TabPane>
          </Tabs>
        </div>
      ) : (
        <Empty />
      )}
    </PageWithHeader>
  );
}
