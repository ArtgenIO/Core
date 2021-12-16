import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageHeader from '../../../admin/layout/page-header.component';
import PageWithHeader from '../../../admin/layout/page-with-header.component';
import { useHttpClientOld } from '../../../admin/library/http-client';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { IBlueprint } from '../../interface/extension.interface';
import ExtensionEdiorComponent from './_editor.component';

export default function EditExtension() {
  const history = useNavigate();
  const params: { id: string } = useParams();
  const client = useHttpClientOld();

  const [extension, setExtension] = useState<IBlueprint>(null);

  const [{ data, loading }] = useHttpClient<IBlueprint>(
    `/api/rest/main/extension/${params.id}`,
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
              .patch(`/api/rest/main/extension/${extension.id}`, extension)
              .then(() => message.success('Extension updated!'))
              .then(() => history('/admin/ext/store'));
          }}
        />
      </div>
    </PageWithHeader>
  );
}
