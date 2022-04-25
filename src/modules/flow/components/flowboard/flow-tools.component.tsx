import {
  DeleteOutlined,
  ExpandOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  VerticalLeftOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Edge, ReactFlowInstance, useReactFlow } from 'react-flow-renderer';
import { IFlow } from '../../interface';
import { Elements } from '../../interface/elements.interface';
import FlowboardSave from './save.component';

type Props = {
  showCatalog: boolean;
  setShowCatalog: Dispatch<SetStateAction<boolean>>;
  setSelectedNodeId: Dispatch<SetStateAction<string>>;
  focusedElementId: string;
  setElements: Dispatch<SetStateAction<Elements>>;
  flowInstance: ReactFlowInstance;
  flow: IFlow;
};

export default function FlowboardTools({
  showCatalog,
  setShowCatalog,
  setSelectedNodeId,
  focusedElementId,
  setElements,
  flowInstance,
  flow,
}: Props) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const doDeleteNode = (nodeId: string) => {
    setElements(els => {
      return els.filter(el => {
        const keys = Object.keys(el);

        // Delete edges
        if (keys.includes('target')) {
          const edge = el as Edge;

          if (edge.target === nodeId || edge.source === nodeId) {
            return false;
          }
        }

        // Delete nodes
        return el.id !== nodeId;
      });
    });

    message.warn('Node has been removed');

    setSelectedNodeId(null);
  };

  return (
    <>
      <div className="absolute right-4 top-4 w-10 rounded-md artboard-tools text-center">
        <div
          className="rounded-t-md"
          onClick={e => {
            e.stopPropagation();
            setShowCatalog(state => !state);
          }}
        >
          {!showCatalog ? <PlusSquareOutlined /> : <VerticalLeftOutlined />}

          <div>{showCatalog ? 'Create Node' : 'Close Catalog'}</div>
        </div>

        <FlowboardSave flow={flow} flowInstance={flowInstance} />

        <div onClick={() => zoomIn({ duration: 1000 })}>
          <ZoomInOutlined />
          <div>Zoom In</div>
        </div>

        <div onClick={() => zoomOut({ duration: 1000 })}>
          <ZoomOutOutlined />
          <div>Zoom Out</div>
        </div>

        <div
          onClick={() =>
            fitView({
              duration: 1000,
            })
          }
        >
          <ExpandOutlined />
          <div>Zoom To Fit</div>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 w-10 rounded-md artboard-tools text-center">
        {focusedElementId ? (
          <>
            <div
              className="rounded-t-md"
              onClick={() => setSelectedNodeId(focusedElementId)}
            >
              <SettingOutlined />
              <div>Configure Node</div>
            </div>

            <div
              className="rounded-b-md"
              onClick={() => doDeleteNode(focusedElementId)}
            >
              <DeleteOutlined />
              <div>Delete Node</div>
            </div>
          </>
        ) : undefined}
      </div>
    </>
  );
}
