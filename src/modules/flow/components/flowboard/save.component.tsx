import { SaveOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { ReactFlowInstance } from 'react-flow-renderer';
import { useHttpClientSimple } from '../../../admin/library/simple.http-client';
import { toRestSysRoute } from '../../../content/util/schema-url';
import { SchemaRef } from '../../../schema/interface/system-ref.enum';
import { IFlow } from '../../interface/flow.interface';
import { serializeFlow } from '../../util/serialize-flow';

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
