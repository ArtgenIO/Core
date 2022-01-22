import { DownloadOutlined, FileAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../admin/layout/page-header.component';
import PageWithHeader from '../../../admin/layout/page-with-header.component';
import OfflineExtensions from './offline.component';

export default function ExtensionStoreList() {
  const base = '/admin/cloud-apps';

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Cloud Apps"
          actions={
            <>
              <Link key="import" to={`${base}/import`}>
                <Button ghost icon={<DownloadOutlined />}>
                  Import Source
                </Button>
              </Link>
              <Link key="create" to={`${base}/create`}>
                <Button type="primary" ghost icon={<FileAddOutlined />}>
                  Create Extension
                </Button>
              </Link>
            </>
          }
        />
      }
    >
      <OfflineExtensions />
    </PageWithHeader>
  );
}
