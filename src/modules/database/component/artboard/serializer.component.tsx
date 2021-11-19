import { CloudDownloadOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import { useState } from 'react';
import { OnLoadParams } from 'react-flow-renderer';
import { SchemaSerializer } from '../../../schema/serializer/schema.serializer';

export default function DatabaseSerializerComponent({
  flowInstance,
}: {
  flowInstance: OnLoadParams;
}) {
  const [source, setSource] = useState<string>('');

  const doShowSerializer = () => {
    const schemas = SchemaSerializer.fromElements(flowInstance.getElements());

    setSource(JSON.stringify(schemas, null, 2));
  };

  return (
    <>
      <div onClick={() => doShowSerializer()} className="rounded-b-md">
        <CloudDownloadOutlined />
        <div>Serialize into JSON</div>
      </div>
      <Modal
        centered
        width="50%"
        title={
          <>
            <CloudDownloadOutlined /> Serialized Schemas
          </>
        }
        visible={!!source.length}
        closable
        maskClosable
        onCancel={() => setSource('')}
        footer={null}
        destroyOnClose
      >
        <Input.TextArea
          showCount
          readOnly
          defaultValue={source}
          rows={25}
        ></Input.TextArea>
      </Modal>
    </>
  );
}
