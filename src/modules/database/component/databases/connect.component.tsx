import { Button, Drawer, Form, Input, message, notification } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { useHttpClientSimple } from '../../../admin/library/simple.http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import { IDatabase } from '../../interface';

type Props = {
  onClose: () => void;
  setDatabases: Dispatch<SetStateAction<IDatabase[]>>;
};

export default function DatabaseConnectComponent({
  onClose,
  setDatabases,
}: Props) {
  const httpClient = useHttpClientSimple();

  const doCreateDatabase = async (formValues: IDatabase) => {
    try {
      await httpClient.post<IDatabase>(
        toRestSysRoute(SchemaRef.DATABASE),
        formValues,
      );

      notification.success({
        message: 'New database added!',
        className: 'test--connected',
      });

      setDatabases(databases => databases.concat(formValues));
      onClose();
    } catch (error) {
      message.error(`Could not connect the database`);
    }
  };

  return (
    <Drawer width="33%" open title="Connect Database" onClose={onClose}>
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
