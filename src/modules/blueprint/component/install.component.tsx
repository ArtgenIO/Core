import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  notification,
  Select,
} from 'antd';
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';
import { databasesAtom } from '../../admin/admin.atoms';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IBlueprint } from '../interface/blueprint.interface';

type FormData = {
  database: string;
  source: string;
};

type Props = {
  onClose?: () => void;
};

export default function InstallBlueprint({ onClose }: Props) {
  const history = useNavigate();
  const client = useHttpClientSimple();
  const databases = useRecoilValue(databasesAtom);

  return (
    <Drawer
      width={800}
      visible
      title="Install Offline Blueprint"
      onClose={() => {
        if (onClose) {
          onClose();
        }
      }}
    >
      <Form
        layout="vertical"
        onFinish={async (values: FormData) => {
          try {
            const blueprint = Object.assign(JSON.parse(values.source), {
              database: values.database,
            } as Pick<IBlueprint, 'database'>);

            await client
              .post(toRestSysRoute(SchemaRef.BLUEPRINT), blueprint)
              .then(() => {
                notification.success({
                  message: 'Blueprint installed',
                  duration: 5,
                });
                history('/admin/cloud-store');
              });
          } catch (error) {
            message.error('Could not import extension');
          }
        }}
      >
        <Form.Item label="Target database" name="database">
          <Select placeholder="Select a target database">
            {databases.map(db => (
              <Select.Option key={db.ref} value={db.ref}>
                {db.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Blueprint Source Code" name="source">
          <Input.TextArea rows={25}></Input.TextArea>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Install
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
