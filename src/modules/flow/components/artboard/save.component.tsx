import { SaveOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useHttpClientOld } from '../../../admin/library/http-client';
import {
  flowInstanceAtom,
  workflowAtom,
  workflowChangedAtom,
} from '../../atom/artboard.atoms';
import { ILogic } from '../../interface/workflow.interface';
import { serializeWorkflow } from '../../util/serialize-workflow';

const SAVING_NOTIFICATION = 'saving-workflow';

export default function ArtboardSave() {
  const httpClient = useHttpClientOld();
  const workflow = useRecoilValue(workflowAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [isWorkflowChanged, setIsWorkflowChanged] =
    useRecoilState(workflowChangedAtom);

  const doSaveWorkflow = () => {
    const serializedWorkflow: ILogic = serializeWorkflow(
      workflow,
      flowInstance.getElements(),
    );

    httpClient
      .patch(`/api/rest/main/workflow/${workflow.id}`, serializedWorkflow)
      .then(() => {
        notification.success({
          key: SAVING_NOTIFICATION,
          message: 'Saved successfully!',
          placement: 'bottomRight',
        });

        setIsWorkflowChanged(false);
      })
      .catch(error => {
        notification.error({
          key: SAVING_NOTIFICATION,
          message: 'Could not save workflow!',
          description: error.message,
          placement: 'bottomRight',
        });
      });
  };

  return (
    <div
      onClick={() => doSaveWorkflow()}
      className={isWorkflowChanged ? 'text-yellow-500' : ''}
    >
      <SaveOutlined />
      <div>Save Changes</div>
    </div>
  );
}
