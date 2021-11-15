import { FileAddOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Select } from 'antd';
import { useHistory } from 'react-router';
import { routeCrudAPI } from '../../../content/crud/util/schema-url';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';
import { useHttpClientOld } from '../../../management/backoffice/library/http-client';
import { IDatabase } from '../interface';

export default function DatabaseAddComponent() {
  const history = useHistory();
  const httpClient = useHttpClientOld();

  const doCreateDatabase = async (formValues: IDatabase) => {
    try {
      await httpClient.post<IDatabase>(
        routeCrudAPI({
          database: 'system',
          reference: 'Database',
        }),
        formValues,
      );
      message.success(`New database added!`);
      history.goBack();
    } catch (error) {
      message.error(`Error while creating the database!`);
    }
  };

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Add New Database"
          avatar={{
            icon: <FileAddOutlined />,
          }}
        />
      }
    >
      <div className="content-box px-24 py-12 w-2/3">
        <Form
          name="database"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={(formValues: IDatabase) => {
            doCreateDatabase(formValues);
          }}
          onFinishFailed={() => message.error('Failed to validate')}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>

          <Form.Item label="DSN" name="dsn">
            <Input />
          </Form.Item>

          <Form.Item label="Type" name="type">
            <Select placeholder="Type">
              <Select.Option key="postgres" value="postgres">
                Postgres
              </Select.Option>
              <Select.Option key="mysql" value="mysql">
                MySQL
              </Select.Option>
              <Select.Option key="sqlite" value="sqlite">
                SQLite
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" block htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </div>
    </PageWithHeader>
  );
}
