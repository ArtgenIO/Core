import { Button, Form, Input, message, Select } from 'antd';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import PageHeader from '../../../admin/layout/page-header.component';
import PageWithHeader from '../../../admin/layout/page-with-header.component';
import { useHttpClientOld } from '../../../admin/library/http-client';
import { useHttpClient } from '../../../admin/library/use-http-client';
import { routeCrudAPI } from '../../../content/util/schema-url';
import { IDatabase } from '../../../database/interface';

type FormData = {
  database: string;
  source: string;
};

export default function ImportExtension() {
  const params = useParams<{ id?: string }>();
  const history = useHistory();
  const client = useHttpClientOld();

  const [waitForSource, setWaitForSource] = useState(true);
  const [source, setSource] = useState('');
  const [{ data: databases, loading }] = useHttpClient<IDatabase[]>(
    routeCrudAPI({
      database: 'main',
      reference: 'Database',
    }),
  );

  useEffect(() => {
    if (params?.id) {
      client.get(`/api/extension-store/${params.id}/install`).then(resp => {
        setSource(
          JSON.stringify(
            {
              ...resp.data,
              source: 'cloud',
              database: 'main',
              installedAt: resp.data.createdAt,
            },
            null,
            2,
          ),
        );
        setWaitForSource(false);
      });
    } else {
      setWaitForSource(false);
    }
  }, [params]);

  if (loading || waitForSource) {
    return <h1>Loading...</h1>;
  }

  return (
    <PageWithHeader header={<PageHeader title="Import Extension" />}>
      <div className="content-box px-8 py-8 w-2/3">
        <Form
          layout="vertical"
          initialValues={{ source }}
          onFinish={(values: FormData) => {
            client
              .post('/api/extension-store/local/import-extension', {
                database: values.database,
                extension: JSON.parse(values.source),
              })
              .then(() => {
                message.success('Extension imported');
                history.push('/admin/ext/store');
              })
              .catch(() => {
                message.error('Could not import extension');
              });
          }}
        >
          <Form.Item label="Import into Database" name="database">
            <Select placeholder="Select a target database">
              {databases.map(db => (
                <Select.Option key={db.ref} value={db.ref}>
                  {startCase(db.ref)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Extension Source Code" name="source">
            <Input.TextArea rows={25}></Input.TextArea>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Import
            </Button>
          </Form.Item>
        </Form>
      </div>
    </PageWithHeader>
  );
}
