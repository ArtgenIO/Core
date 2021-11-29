import { message } from 'antd';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { v4 } from 'uuid';
import PageHeader from '../../admin/layout/PageHeader';
import PageWithHeader from '../../admin/layout/PageWithHeader';
import { useHttpClientOld } from '../../admin/library/http-client';
import { IExtension } from '../interface/extension.interface';
import ExtensionEdiorComponent from './_editor.component';

export default function CreateExtensionComponent() {
  const history = useHistory();
  const client = useHttpClientOld();

  const [extension, setExtension] = useState<IExtension>({
    id: v4(),
    label: 'My Blog',
    version: '0.0.1',
    database: 'system',
    source: 'offline',
    config: {},
    schemas: [],
    workflows: [],
  });

  return (
    <PageWithHeader header={<PageHeader title="Create Extension" />}>
      <div className="content-box px-8 py-8 w-2/3">
        <ExtensionEdiorComponent
          extension={extension}
          setExtension={setExtension}
          onSave={() => {
            client
              .post('/api/rest/system/extension', extension)
              .then(() => message.success('Extension saved!'))
              .then(() => history.push('/admin/extension'));
          }}
        />
      </div>
    </PageWithHeader>
  );
}
