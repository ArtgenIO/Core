import { notification } from 'antd';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IBlueprint } from '../interface/blueprint.interface';
import BlueprintEditorComponent from './_editor.component';

export default function CreateBlueprint() {
  const redirect = useNavigate();
  const client = useHttpClientSimple();

  const blueprint: IBlueprint = {
    id: v4(),
    title: 'My Awesome Blueprint',
    cover:
      'https://user-images.githubusercontent.com/3441017/140712817-6de39d70-74ab-43d2-924f-b02776953c27.png',
    description: 'Tell more about it!',
    version: '0.0.1',
    database: 'main',
    source: 'offline',
    schemas: [],
    content: {},
  };

  return (
    <PageWithHeader header={<PageHeader title="Create Blueprint" />}>
      <div className="content-box px-8 py-8 w-2/3">
        <BlueprintEditorComponent
          blueprint={blueprint}
          onSave={_blueprint => {
            client
              .post(toRestSysRoute(SchemaRef.BLUEPRINT), _blueprint)
              .then(() =>
                notification.success({ message: 'Blueprint created!' }),
              )
              .then(() => redirect('/admin/cloud-store'));
          }}
        />
      </div>
    </PageWithHeader>
  );
}
