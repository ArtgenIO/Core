import { Button, Drawer, Form, Input, message, notification } from 'antd';
import { useHttpClientOld } from '../../admin/library/http-client';
import { IDatabase } from '../interface';

type Props = {
  onClose: () => void;
  connection: IDatabase;
};

export default function EditComponent({ onClose, connection }: Props) {
  const httpClient = useHttpClientOld();

  const doUpdateDatabase = async (values: IDatabase) => {
    try {
      await httpClient.patch<IDatabase>(
        `/api/rest/main/database/${values.ref}`,
        values,
      );

      notification.success({
        message: 'Connection updated!',
        className: 'test--updated',
      });

      onClose();
    } catch (error) {
      message.error(`Could not update the connection`);
    }
  };

  return (
    <Drawer
      width={450}
      visible={true}
      title="Edit Connection"
      onClose={onClose}
    >
      <Form
        layout="vertical"
        name="database"
        onFinish={(formValues: IDatabase) => {
          doUpdateDatabase(formValues);
        }}
        initialValues={connection}
        onFinishFailed={() => message.error('Failed to validate')}
      >
        <Form.Item label="Title" name="title">
          <Input className="test--db-title" required />
        </Form.Item>

        <Form.Item label="Reference" name="ref">
          <Input className="test--db-ref" required />
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
