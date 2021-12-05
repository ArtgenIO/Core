import { Tabs } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { ICollection } from '../../../../collection';
import SchemaEditorCapabilitiesComponent from './capabilities.component';
import SchemaEditorFieldsComponent from './fields.component';
import SchemaEditorIndexesComponent from './indexes.component';
import SchemaEditorNamingComponent from './naming.component';
import RelationsComponent from './relations.component';

type Props = {
  schema: ICollection;
  setSchema: Dispatch<SetStateAction<ICollection>>;
};

export default function SchemaEditorFrameComponent({
  schema,
  setSchema,
}: Props) {
  return (
    <Tabs tabPosition="left" size="large" style={{ minHeight: 600 }}>
      <Tabs.TabPane key="naming" tab="Naming">
        <SchemaEditorNamingComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="capabilities" tab="Capabilities">
        <SchemaEditorCapabilitiesComponent
          schema={schema}
          setSchema={setSchema}
        />
      </Tabs.TabPane>
      <Tabs.TabPane key="fields" tab="Fields">
        <SchemaEditorFieldsComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="relations" tab="Relations">
        <RelationsComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="indices" tab="Indices">
        <SchemaEditorIndexesComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
    </Tabs>
  );
}
