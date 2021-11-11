import { Tabs } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { ISchema } from '../..';
import CapabilitiesComponent from './capabilities.component';
import SchemaFieldsComponent from './fields.component';
import IndexesComponent from './indexes.component';
import NamingComponent from './naming.component';
import RelationsComponent from './relations.component';

type Props = {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
};

export default function SchemaEditorFrameComponent({
  schema,
  setSchema,
}: Props) {
  return (
    <Tabs tabPosition="left" size="large" style={{ minHeight: 600 }}>
      <Tabs.TabPane key="naming" tab="Naming">
        <NamingComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="capabilities" tab="Capabilities">
        <CapabilitiesComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="fields" tab="Fields">
        <SchemaFieldsComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="relations" tab="Relations">
        <RelationsComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
      <Tabs.TabPane key="indices" tab="Indices">
        <IndexesComponent schema={schema} setSchema={setSchema} />
      </Tabs.TabPane>
    </Tabs>
  );
}
