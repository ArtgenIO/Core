import { SaveOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useHttpClient } from '../../../backoffice/library/http-client';
import {
  flowInstanceAtom,
  workflowAtom,
  workflowChangedAtom,
} from '../../atom/drawboard.atoms';
import { IWorkflow } from '../../interface/workflow.interface';
import { serializeWorkflow } from '../../util/serialize-workflow';

const SAVING_NOTIFICATION = 'saving-workflow';

export default function DrawboardSave() {
  const httpClient = useHttpClient();
  const workflow = useRecoilValue(workflowAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [isWorkflowChanged, setIsWorkflowChanged] =
    useRecoilState(workflowChangedAtom);

  const doSaveWorkflow = () => {
    const serializedWorkflow: IWorkflow = serializeWorkflow(
      workflow,
      flowInstance.getElements(),
    );

    httpClient
      .patch(`/api/workflow/${workflow.id}`, serializedWorkflow)
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
