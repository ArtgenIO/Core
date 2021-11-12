import {
  ClusterOutlined,
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
import { Elements, OnLoadParams } from 'react-flow-renderer';
import DatabaseSaveComponent from './save.component';
import DatabaseSerializerComponent from './serializer.component';

export default function DatabaseToolsComponent({
  flowInstance,
  layoutOrganizer,
  setElements,
  setOpenedNode,
  doSave,
  doNew,
  selectedNode,
  doRemove,
}: {
  flowInstance: OnLoadParams;
  layoutOrganizer: any;
  setElements: Dispatch<SetStateAction<Elements>>;
  setOpenedNode: Dispatch<SetStateAction<string>>;
  doSave: () => Promise<void>;
  doNew: () => void;
  doRemove: () => void;
  selectedNode: string;
}) {
  return (
    <>
      <div className="absolute right-4 top-4 w-10 rounded-md drawboard-tools text-center">
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

        <DatabaseSaveComponent doSave={doSave} />

        <div onClick={() => setElements(el => layoutOrganizer(el))}>
          <ClusterOutlined />
          <div>Organize Structure</div>
        </div>

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

        <DatabaseSerializerComponent flowInstance={flowInstance} />
      </div>

      <div className="absolute right-4 bottom-4 w-10 rounded-md drawboard-tools text-center">
        {selectedNode ? (
          <>
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
