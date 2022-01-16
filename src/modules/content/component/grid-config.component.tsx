import { DownOutlined, EyeOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Drawer, List } from 'antd';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { ISchema } from '../../schema';

type Props = {
  schema: ISchema;
  onClose: () => void;
};

export default function ContentGridConfigComponent({ schema, onClose }: Props) {
  const httpClient = useHttpClientSimple();

  const doUpdate = async (form: any) => {
    onClose();
  };

  return (
    <Drawer
      width="30%"
      visible={true}
      title={`Grid Config » ${schema.title}`}
      onClose={onClose}
    >
      <List
        size="small"
        className="rounded-sm"
        bordered
        dataSource={schema.fields}
        renderItem={(field, idx) => (
          <List.Item>
            <List.Item.Meta title={<b>{field.title}</b>}></List.Item.Meta>

            <Button.Group size="small">
              <Button icon={<EyeOutlined />} />
              <Button icon={<UpOutlined />} disabled={idx === 0} />
              <Button
                icon={<DownOutlined />}
                disabled={idx + 1 === schema.fields.length}
              />
            </Button.Group>
          </List.Item>
        )}
      />
    </Drawer>
  );
}
