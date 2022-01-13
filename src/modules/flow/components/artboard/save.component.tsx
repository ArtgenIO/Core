import { SaveOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useHttpClientSimple } from '../../../admin/library/http-client';
import {
  flowAtom,
  flowChangedAtom,
  flowInstanceAtom,
} from '../../atom/artboard.atoms';
import { IFlow } from '../../interface/flow.interface';
import { serializeFlow } from '../../util/serialize-flow';

const SAVING_NOTIFICATION = 'saving-flow';

export default function ArtboardSave() {
  const httpClient = useHttpClientSimple();
  const flow = useRecoilValue(flowAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [isFlowChanged, setIsFlowChanged] = useRecoilState(flowChangedAtom);

  const doSaveFlow = () => {
    const serializedFlow: IFlow = serializeFlow(
      flow,
      flowInstance.getElements(),
    );

    httpClient
      .patch(`/api/rest/main/flow/${flow.id}`, serializedFlow)
      .then(() => {
        notification.success({
          key: SAVING_NOTIFICATION,
          message: 'Saved successfully!',
          placement: 'bottomRight',
        });

        setIsFlowChanged(false);
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
    <div
      onClick={() => doSaveFlow()}
      className={isFlowChanged ? 'text-yellow-500' : ''}
    >
      <SaveOutlined />
      <div>Save Changes</div>
    </div>
  );
}
