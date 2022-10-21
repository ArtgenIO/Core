import { DatabaseOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import startCase from 'lodash.startcase';

export default function DatabaseNameComponent({ name }: { name: string }) {
  return (
    <div className="absolute top-3 left-3 z-10 flex">
      <div>
        <DatabaseOutlined className="text-4xl" style={{ lineHeight: '4rem' }} />
      </div>
      <div>
        <Input
          defaultValue={startCase(name)}
          bordered={false}
          placeholder="Database name"
          required
          readOnly
          className="text-3xl"
          style={{ lineHeight: '3rem' }}
        />
      </div>
    </div>
  );
}
