import {
  ClusterOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExpandOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  VerticalLeftOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Popconfirm } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { useReactFlow } from 'reactflow';
import { Elements } from '../../../flow/interface/elements.interface';
import { ISchema } from '../../types/schema.interface';

export default function DatabaseToolsComponent({
  layoutOrganizer,
  setElements,
  setOpenedNode,
  doNew,
  selectedNode,
  doRemove,
}: {
  layoutOrganizer: any;
  setElements: Dispatch<SetStateAction<Elements>>;
  setOpenedNode: Dispatch<SetStateAction<ISchema>>;
  doNew: () => void;
  doRemove: (schema: ISchema) => void;
  selectedNode: ISchema;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <>
      <div className="absolute right-4 top-4 w-10 rounded-md artboard-tools text-center">
        <div
          className="rounded-t-md"
          onClick={e => {
            e.stopPropagation();
            doNew();
          }}
        >
          {1 ? <PlusSquareOutlined /> : <VerticalLeftOutlined />}

          <div>{1 ? 'Create Schema' : 'Close Catalog'}</div>
        </div>

        <div onClick={() => setElements(el => layoutOrganizer(el))}>
          <ClusterOutlined />
          <div>Organize Structure</div>
        </div>

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
        {selectedNode ? (
          <>
            <div className="rounded-t-md">
              <CopyOutlined />
              <div>Copy Schema</div>
            </div>

            <div
              className="rounded-t-md"
              onClick={() => setOpenedNode(selectedNode)}
            >
              <SettingOutlined />
              <div>Configure Schema</div>
            </div>

            <Popconfirm
              title={`Are you sure want to delete the [${selectedNode.reference}] schema?`}
              onConfirm={() => doRemove(selectedNode)}
            >
              <div className="rounded-b-md">
                <DeleteOutlined />
                <div>Delete Schema</div>
              </div>
            </Popconfirm>
          </>
        ) : undefined}
      </div>
    </>
  );
}
