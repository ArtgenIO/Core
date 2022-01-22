import { message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';
import PageHeader from '../../../admin/layout/page-header.component';
import PageWithHeader from '../../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../../admin/library/http-client';
import { IBlueprint } from '../../interface/blueprint.interface';
import ExtensionEdiorComponent from './_editor.component';

export default function CreateExtension() {
  const redirect = useNavigate();
  const client = useHttpClientSimple();

  const [extension, setExtension] = useState<IBlueprint>({
    id: v4(),
    title: 'My Blog',
    version: '0.0.1',
    database: 'main',
    source: 'offline',
    schemas: [],
    content: {},
  });

  return (
    <PageWithHeader header={<PageHeader title="Create Blueprint" />}>
      <div className="content-box px-8 py-8 w-2/3">
        <ExtensionEdiorComponent
          blueprint={extension}
          setExtension={setExtension}
          onSave={() => {
            client
              .post('/api/rest/main/extension', extension)
              .then(() => message.success('Extension saved!'))
              .then(() => redirect('/admin/cloud-apps/store'));
          }}
        />
      </div>
    </PageWithHeader>
  );
}
