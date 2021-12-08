import { FileAddOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, notification } from 'antd';
import { useHistory } from 'react-router';
import { ADMIN_URL } from '../../admin/admin.constants';
import PageHeader from '../../admin/layout/PageHeader';
import PageWithHeader from '../../admin/layout/PageWithHeader';
import { useHttpClientOld } from '../../admin/library/http-client';
import { IDatabase } from '../interface';

export default function DatabaseAddComponent() {
  const history = useHistory();
  const httpClient = useHttpClientOld();

  const doCreateDatabase = async (formValues: IDatabase) => {
    try {
      await httpClient.post<IDatabase>('/api/rest/main/database', formValues);
      notification.success({
        message: 'New database added!',
        className: 'test--connected',
      });

      history.push(`${ADMIN_URL}/database`);
    } catch (error) {
      message.error(`Could not connect the database`);
    }
  };

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Connect Database"
          avatar={{
            icon: <FileAddOutlined />,
          }}
        />
      }
    >
      <div className="content-box px-12 py-6 lg:w-1/2 w-full">
        <Form
          layout="vertical"
          name="database"
          onFinish={(formValues: IDatabase) => {
            doCreateDatabase(formValues);
          }}
          onFinishFailed={() => message.error('Failed to validate')}
        >
          <Form.Item label="Title" name="title">
            <Input className="test--db-title" required />
          </Form.Item>

          <Form.Item label="Name" name="name">
            <Input className="test--db-name" required />
          </Form.Item>

          <Form.Item label="DSN" name="dsn">
            <Input className="test--db-dsn" required />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              ghost
              htmlType="submit"
              className="test--connect-sub"
            >
              Connect
            </Button>
          </Form.Item>
        </Form>
      </div>
    </PageWithHeader>
  );
}
