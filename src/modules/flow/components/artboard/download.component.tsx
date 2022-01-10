import { CloudDownloadOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { flowAtom, flowInstanceAtom } from '../../atom/artboard.atoms';
import { IFlow } from '../../interface/flow.interface';
import { serializeFlow } from '../../util/serialize-flow';

export default function ArtboardDownload() {
  const flow = useRecoilValue(flowAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [source, setSource] = useState<string>('');

  const doDownloadFlow = () => {
    const serializedFlow: IFlow = serializeFlow(
      flow,
      flowInstance.getElements(),
    );

    setSource(JSON.stringify(serializedFlow, null, 2));
  };

  return (
    <>
      <div onClick={() => doDownloadFlow()} className="rounded-b-md">
        <CloudDownloadOutlined />
        <div>Download as JSON</div>
      </div>
      <Modal
        centered
        width="50%"
        title={
          <>
            <CloudDownloadOutlined /> Serialized Flow
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
