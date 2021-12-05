import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import PageHeader from '../../../admin/layout/PageHeader';
import PageWithHeader from '../../../admin/layout/PageWithHeader';
import { useHttpClientOld } from '../../../admin/library/http-client';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { IExtension } from '../../interface/extension.interface';
import ExtensionEdiorComponent from './_editor.component';

export default function EditExtension() {
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const client = useHttpClientOld();

  const [extension, setExtension] = useState<IExtension>(null);

  const [{ data, loading }] = useHttpClient<IExtension>(
    `/api/rest/system/extension/${params.id}`,
  );

  useEffect(() => {
    if (data) {
      setExtension(data);
    }
  }, [data]);

  if (loading || !data) {
    return <h1>Loading...</h1>;
  }

  return (
    <PageWithHeader header={<PageHeader title="Edit Extension" />}>
      <div className="content-box px-8 py-8 w-2/3">
        <ExtensionEdiorComponent
          extension={extension}
          setExtension={setExtension}
          onSave={() => {
            client
              .patch(`/api/rest/system/extension/${extension.id}`, extension)
              .then(() => message.success('Extension updated!'))
              .then(() => history.push('/admin/ext/store'));
          }}
        />
      </div>
    </PageWithHeader>
  );
}
