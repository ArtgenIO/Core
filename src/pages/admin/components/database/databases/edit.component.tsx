import { Button, Drawer, Form, Input, message, notification } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { SchemaRef } from '../../../../../api/types/system-ref.enum';
import { IDatabase } from '../../../../../models/database.interface';
import { toRestSysRoute } from '../../../library/schema-url';
import { useHttpClientSimple } from '../../../library/simple.http-client';

type Props = {
  onClose: () => void;
  setDatabases: Dispatch<SetStateAction<IDatabase[]>>;
  database: IDatabase;
};

export default function DatabaseEditComponent({
  onClose,
  setDatabases,
  database,
}: Props) {
  const httpClient = useHttpClientSimple();

  const doUpdateDatabase = async (formValues: IDatabase) => {
    try {
      await httpClient.patch<IDatabase>(
        `${toRestSysRoute(SchemaRef.DATABASE)}/${formValues.ref}`,
        formValues,
      );

      notification.success({
        message: 'Changes are saved!',
        className: 'test--updated',
      });

      setDatabases(dbs =>
        dbs.map(r => (r.ref == database.ref ? formValues : r)),
      );

      onClose();
    } catch (error) {
      message.error('Could not update the database');
    }
  };

  return (
    <Drawer width={450} open={true} title="Edit Database" onClose={onClose}>
      <Form
        layout="vertical"
        name="database"
        onFinish={(formValues: IDatabase) => {
          doUpdateDatabase(formValues);
        }}
        initialValues={database}
        onFinishFailed={() => message.error('Failed to validate')}
      >
        <Form.Item label="Title" name="title">
          <Input className="test--db-title" required />
        </Form.Item>

        <Form.Item label="Reference" name="ref">
          <Input className="test--db-ref" readOnly disabled />
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
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
