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
import React, { Dispatch, SetStateAction } from 'react';
import { Elements, useZoomPanHelper } from 'react-flow-renderer';
import { ISchema } from '../../../schema';

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
  doRemove: () => void;
  selectedNode: ISchema;
}) {
  const { zoomIn, zoomOut, fitView } = useZoomPanHelper();

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

        <div onClick={() => zoomIn()}>
          <ZoomInOutlined />
          <div>Zoom In</div>
        </div>

        <div onClick={() => zoomOut()}>
          <ZoomOutOutlined />
          <div>Zoom Out</div>
        </div>

        <div onClick={() => fitView()}>
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
              title="Are you sure want to delete the selected schema?"
              onConfirm={doRemove}
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
