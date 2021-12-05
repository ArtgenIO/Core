import { DownloadOutlined, FileAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../admin/layout/PageHeader';
import PageWithHeader from '../../../admin/layout/PageWithHeader';
import CloudExtensions from './list/cloud.component';
import OfflineExtensions from './list/offline.component';

export default function ExtensionStoreList() {
  const base = '/admin/ext/store';

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Extension Store"
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
      <CloudExtensions />
      <OfflineExtensions />
    </PageWithHeader>
  );
}
