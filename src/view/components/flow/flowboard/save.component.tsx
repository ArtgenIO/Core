import { SaveOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { ReactFlowInstance } from 'reactflow';
import { IFlow } from '../../../../types/flow.interface';
import { SchemaRef } from '../../../../types/system-ref.enum';
import { toRestSysRoute } from '../../../library/schema-url';
import { serializeFlow } from '../../../library/serialize-flow';
import { useHttpClientSimple } from '../../../library/simple.http-client';

const SAVING_NOTIFICATION = 'saving-flow';

type Props = {
  flowInstance: ReactFlowInstance;
  flow: IFlow;
};

export default function FlowboardSave({ flowInstance, flow }: Props) {
  const httpClient = useHttpClientSimple();

  const doSaveFlow = () => {
    const serializedFlow: IFlow = serializeFlow(flow, [
      ...flowInstance.getNodes(),
      ...flowInstance.getEdges(),
    ]);

    httpClient
      .patch(`${toRestSysRoute(SchemaRef.FLOW)}/${flow.id}`, serializedFlow)
      .then(() => {
        notification.success({
          key: SAVING_NOTIFICATION,
          message: 'Saved successfully!',
          placement: 'bottomRight',
        });
      })
      .catch(error => {
        notification.error({
          key: SAVING_NOTIFICATION,
          message: 'Could not save flow!',
          description: error.message,
          placement: 'bottomRight',
        });
      });
  };

  return (
    <div onClick={() => doSaveFlow()}>
      <SaveOutlined />
      <div>Save Changes</div>
    </div>
  );
}
