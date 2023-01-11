import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { SchemaRef } from '../../../../api/types/system-ref.enum';
import { IPage } from '../../../../models/page.interface';
import { toRestSysRoute } from '../../library/schema-url';
import { useHttpClientSimple } from '../../library/simple.http-client';

type Props = {
  onClose: () => void;
};

export default function CreatePageComponent({ onClose }: Props) {
  const navigate = useNavigate();
  const client = useHttpClientSimple();

  const [title, setTitle] = useState(null);
  const [path, setPath] = useState(`/p/${v4()}`);

  return (
    <Drawer width="40%" open title="Create New Page" onClose={onClose}>
      <Form
        layout="vertical"
        size="large"
        onSubmitCapture={() => {
          const page: IPage = {
            id: v4(),
            title: title,
            path: path,
            content: {},
            tags: [],
          };

          client
            .post<IPage>(toRestSysRoute(SchemaRef.PAGE), page)
            .then(() => navigate(`/admin/page/${page.id}`));
        }}
      >
        <Form.Item label="Title">
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </Form.Item>

        <Form.Item label="Path">
          <Input value={path} onChange={e => setPath(e.target.value)} />
        </Form.Item>

        <Button
          block
          type="primary"
          icon={<PlusCircleOutlined />}
          htmlType="submit"
        >
          Create
        </Button>
      </Form>
    </Drawer>
  );
}
