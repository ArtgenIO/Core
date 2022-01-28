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
import { Edge } from 'react-flow-renderer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  elementsAtom,
  flowInstanceAtom,
  selectedElementIdAtom,
  selectedNodeIdAtom,
} from '../../atom/artboard.atoms';
import ArtboardSave from './save.component';

type Props = {
  showCatalog: boolean;
  setShowCatalog: Dispatch<SetStateAction<boolean>>;
};

export default function ArtboardToolsComponent({
  showCatalog,
  setShowCatalog,
}: Props) {
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const selectedElementId = useRecoilValue(selectedElementIdAtom);
  const setSelectedNodeId = useSetRecoilState(selectedNodeIdAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);

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

        <ArtboardSave />

        <div onClick={() => flowInstance.zoomIn()}>
          <ZoomInOutlined />
          <div>Zoom In</div>
        </div>

        <div onClick={() => flowInstance.zoomOut()}>
          <ZoomOutOutlined />
          <div>Zoom Out</div>
        </div>

        <div onClick={() => flowInstance.fitView()}>
          <ExpandOutlined />
          <div>Zoom To Fit</div>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 w-10 rounded-md artboard-tools text-center">
        {selectedElementId ? (
          <>
            <div
              className="rounded-t-md"
              onClick={() => setSelectedNodeId(selectedElementId)}
            >
              <SettingOutlined />
              <div>Configure Node</div>
            </div>

            <div
              className="rounded-b-md"
              onClick={() => doDeleteNode(selectedElementId)}
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
