import { CodeOutlined, FileAddOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { v4 } from 'uuid';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/simple.http-client';
import { toRestSysRoute } from '../../content/util/schema-url';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import InstallBlueprint from './install.component';
import ListCloudApps from './list-apps.component';
import BlueprintEditorComponent from './_editor.component';

export default function CloudAppsRouter() {
  const client = useHttpClientSimple();

  const [showInstall, setShowInstall] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Cloud Store"
          actions={
            <>
              <Button
                key="edit"
                ghost
                icon={<CodeOutlined />}
                onClick={() => setShowInstall(true)}
              >
                Install Offline Blueprint
              </Button>

              <Button
                key="create"
                type="primary"
                ghost
                icon={<FileAddOutlined />}
                onClick={() => setShowCreate(true)}
              >
                Create Blueprint
              </Button>
            </>
          }
        />
      }
    >
      <ListCloudApps />

      {showInstall && (
        <InstallBlueprint onClose={() => setShowInstall(false)} />
      )}
      {showCreate && (
        <BlueprintEditorComponent
          blueprint={{
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
          }}
          onSave={_blueprint => {
            if (_blueprint.title !== 'My Awesome Blueprint') {
              client
                .post(toRestSysRoute(SchemaRef.BLUEPRINT), _blueprint)
                .then(() =>
                  notification.success({ message: 'Blueprint created!' }),
                );
            }
            setShowCreate(false);
          }}
        />
      )}
    </PageWithHeader>
  );
}
