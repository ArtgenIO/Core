import { Button, Drawer, Form, Input, message, notification } from 'antd';
import { useHttpClientOld } from '../../admin/library/http-client';
import { IDatabase } from '../interface';

export default function DatabaseAddComponent({
  onClose,
}: {
  onClose: () => void;
}) {
  const httpClient = useHttpClientOld();

  const doCreateDatabase = async (formValues: IDatabase) => {
    try {
      await httpClient.post<IDatabase>('/api/rest/main/database', formValues);
      notification.success({
        message: 'New database added!',
        className: 'test--connected',
      });

      onClose();
    } catch (error) {
      message.error(`Could not connect the database`);
    }
  };

  return (
    <Drawer
      width={450}
      visible={true}
      title="Connect Database"
      onClose={onClose}
    >
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

        <Form.Item label="Reference" name="name">
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
    </Drawer>
  );
}
