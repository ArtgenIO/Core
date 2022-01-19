import { SaveOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Drawer, message, Popconfirm, Tabs } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import isEqual from 'lodash.isequal';
import { Suspense, useEffect, useState } from 'react';
import { ISchema } from '..';
import PageLoading from '../../admin/layout/page-loading.component';
import SchemaEditorCapabilitiesComponent from './editor/capabilities.component';
import SchemaExportComponent from './editor/export.component';
import SchemaEditorFieldsComponent from './editor/fields.component';
import SchemaEditorNamingComponent from './editor/naming.component';
import RelationsComponent from './editor/relations.component';

type Props = {
  schema: ISchema;
  onClose: (newState: ISchema | null) => void;
};

export default function SchemaEditorComponent({
  schema: immutableSchema,
  onClose,
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
      width="50%"
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
              ) : (
                isNewSchema && (
                  <Popconfirm
                    title="Are You sure want to discard the schema?"
                    okText="Yes, I understand"
                    onConfirm={() => onClose(null)}
                  >
                    <Button danger block icon={<WarningOutlined />}>
                      Discard Schema
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
        <ErrorBoundary>
          <Tabs tabPosition="left" size="middle" defaultActiveKey="fields">
            <Tabs.TabPane key="naming" tab="General">
              <SchemaEditorNamingComponent
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
              <RelationsComponent schema={schema} setSchema={setSchema} />
            </Tabs.TabPane>
            <Tabs.TabPane key="indices" tab="Serialize">
              <SchemaExportComponent schema={schema} setSchema={setSchema} />
            </Tabs.TabPane>
          </Tabs>
        </ErrorBoundary>
      </Suspense>
    </Drawer>
  );
}
