import { CloudDownloadOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { flowInstanceAtom, workflowAtom } from '../../atom/artboard.atoms';
import { IWorkflow } from '../../interface/workflow.interface';
import { serializeWorkflow } from '../../util/serialize-workflow';

export default function ArtboardDownload() {
  const workflow = useRecoilValue(workflowAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [source, setSource] = useState<string>('');

  const doDownloadWorkflow = () => {
    const serializedWorkflow: IWorkflow = serializeWorkflow(
      workflow,
      flowInstance.getElements(),
    );

    setSource(JSON.stringify(serializedWorkflow, null, 2));
  };

  return (
    <>
      <div onClick={() => doDownloadWorkflow()} className="rounded-b-md">
        <CloudDownloadOutlined />
        <div>Download as JSON</div>
      </div>
      <Modal
        centered
        width="50%"
        title={
          <>
            <CloudDownloadOutlined /> Serialized Workflow
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
