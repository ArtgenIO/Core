import { WarningOutlined } from '@ant-design/icons';
import { Button, Drawer, message, Popconfirm, Spin, Tabs } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { Suspense, useEffect, useState } from 'react';
import { ISchema } from '..';
import SchemaEditorCapabilitiesComponent from './editor/capabilities.component';
import SchemaEditorFieldsComponent from './editor/fields.component';
import SchemaEditorIndexesComponent from './editor/indexes.component';
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
              <Popconfirm
                title="Are You sure want to discard the changes?"
                okText="Yes, I understand"
                onConfirm={() => onClose(null)}
              >
                <Button danger block icon={<WarningOutlined />}>
                  Discard Changes
                </Button>
              </Popconfirm>
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
        } else {
          onClose(schema);
        }
      }}
    >
      <Suspense fallback={<Spin />}>
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
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="relations" tab="Relations">
              <RelationsComponent schema={schema} setSchema={setSchema} />
            </Tabs.TabPane>
            <Tabs.TabPane key="indices" tab="Indices">
              <SchemaEditorIndexesComponent
                schema={schema}
                setSchema={setSchema}
              />
            </Tabs.TabPane>
          </Tabs>
        </ErrorBoundary>
        );
      </Suspense>
    </Drawer>
  );
}
