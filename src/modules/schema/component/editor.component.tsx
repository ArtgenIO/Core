import {
  DeleteOutlined,
  SaveOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Button, Drawer, message, Popconfirm, Tabs } from 'antd';
import isEqual from 'lodash.isequal';
import { Suspense, useEffect, useState } from 'react';
import { ISchema } from '..';
import PageLoading from '../../admin/layout/page-loading.component';
import SchemaEditorCapabilitiesComponent from './editor/capabilities.component';
import DangerZoneComponent from './editor/danger-zone.component';
import SchemaExportComponent from './editor/export.component';
import SchemaEditorFieldsComponent from './editor/fields.component';
import SchemaEditorGeneralComponent from './editor/general.component';
import RelationsComponent from './editor/relations.component';

type Props = {
  schema: ISchema;
  onClose: (newState: ISchema | null) => void;
  doRemove?: (schema: ISchema) => void;
  defaultKey?: string;
};

export default function SchemaEditorComponent({
  schema: immutableSchema,
  onClose,
  doRemove,
  defaultKey,
}: Props) {
  const [schema, setSchema] = useState<ISchema>(null);
  const [isNewSchema, setIsNewSchema] = useState(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (immutableSchema) {
      setIsNewSchema(immutableSchema.reference === '__new_schema');
      setSchema(immutableSchema);
    }

    return () => {
      setSchema(null);
      setIsNewSchema(null);
    };
  }, [immutableSchema]);

  useEffect(() => {
    if (schema && immutableSchema) {
      setIsChanged(!isEqual(schema, immutableSchema));
    }
  }, [schema]);

  if (!schema) {
    return <></>;
  }

  return (
    <Drawer
      width={1080}
      title={
        <div className="flex w-full">
          <div className="grow">Schema » {schema.title}</div>
          <div className="shrink">
            <div className="-mt-1">
              {isChanged ? (
                <Button
                  className="text-yellow-500 border-yellow-500 hover:text-yellow-200 hover:border-yellow-200"
                  block
                  icon={<SaveOutlined />}
                  onClick={() => setSchema(immutableSchema)}
                >
                  Restore Changes
                </Button>
              ) : isNewSchema ? (
                <Popconfirm
                  title="Are You sure want to discard the schema?"
                  okText="Yes, I understand"
                  onConfirm={() => onClose(null)}
                >
                  <Button danger block icon={<WarningOutlined />}>
                    Discard Schema
                  </Button>
                </Popconfirm>
              ) : (
                doRemove && (
                  <Popconfirm
                    title="Are You sure want to delete the schema?"
                    okText="Yes, I understand"
                    onConfirm={() => {
                      doRemove(immutableSchema);
                      onClose(null);
                    }}
                  >
                    <Button danger block icon={<DeleteOutlined />}>
                      Delete Schema
                    </Button>
                  </Popconfirm>
                )
              )}
            </div>
          </div>
        </div>
      }
      visible
      closable
      maskClosable
      footer={null}
      onClose={() => {
        if (schema.reference === '__new_schema') {
          message.warn('Please first change the name and reference');
        } else if (isChanged) {
          onClose(schema);
        } else {
          onClose(null);
        }
      }}
    >
      <Suspense fallback={<PageLoading />}>
        <>
          <Tabs
            tabPosition="left"
            size="middle"
            defaultActiveKey={defaultKey ?? 'general'}
          >
            <Tabs.TabPane key="general" tab="General">
              <SchemaEditorGeneralComponent
                isNewSchema={isNewSchema}
                schema={schema}
                setSchema={setSchema}
              />
            </Tabs.TabPane>

            <Tabs.TabPane key="capabilities" tab="Capabilities">
              <SchemaEditorCapabilitiesComponent
                schema={schema}
                setSchema={setSchema}
              />
            </Tabs.TabPane>

            <Tabs.TabPane key="fields" tab="Fields">
              <SchemaEditorFieldsComponent
                schema={schema}
                setSchema={setSchema}
                isNewSchema={isNewSchema}
                immutableSchema={immutableSchema}
              />
            </Tabs.TabPane>

            <Tabs.TabPane key="relations" tab="Relations">
              <RelationsComponent
                isNewSchema={isNewSchema}
                schema={schema}
                setSchema={setSchema}
              />
            </Tabs.TabPane>

            <Tabs.TabPane key="indices" tab="Serialize">
              <SchemaExportComponent schema={schema} />
            </Tabs.TabPane>

            <Tabs.TabPane
              key="danger"
              tab={<span className="text-red-500">Danger Zone</span>}
            >
              <DangerZoneComponent schema={schema} setSchema={setSchema} />
            </Tabs.TabPane>
          </Tabs>
        </>
      </Suspense>
    </Drawer>
  );
}
