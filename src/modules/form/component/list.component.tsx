import {
  FileAddOutlined,
  FormOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { IFlow } from '../../flow/interface';
import CreateFormComponent from './create.component';

export default function FormListComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms] = useState<IFlow[]>([]);
  const client = useHttpClientSimple();
  const navigate = useNavigate();
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
