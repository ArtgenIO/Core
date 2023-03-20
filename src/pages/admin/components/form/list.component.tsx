import {
  FileAddOutlined,
  FormOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../layout/page-header.component';
import PageWithHeader from '../../layout/page-with-header.component';
import CreateFormComponent from './create.component';

export default function FormListComponent() {
  const [showCreate, setShowCreate] = useState<boolean>(false);

  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Forms"
          avatar={{
            icon: <FormOutlined />,
          }}
          actions={
            <>
              <Link to={'/admin/flow/import'}>
                <Button type="ghost" icon={<UploadOutlined />} key="import">
                  Import Form
                </Button>
              </Link>
              <Button
                onClick={() => setShowCreate(true)}
                type="primary"
                icon={<FileAddOutlined />}
                key="new"
              >
                New Form
              </Button>
            </>
          }
        />
      }
    >
      {showCreate && (
        <CreateFormComponent onClose={() => setShowCreate(false)} />
      )}
    </PageWithHeader>
  );
}
