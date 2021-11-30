import { FileAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { v4 } from 'uuid';
import PageHeader from '../../admin/layout/PageHeader';
import PageWithHeader from '../../admin/layout/PageWithHeader';

export default function AnalyticsListComponent() {
  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Analytics"
          actions={
            <Link key="create" to={`/admin/analytics/${v4()}/editor`}>
              <Button type="primary" icon={<FileAddOutlined />}>
                New Analytics
              </Button>
            </Link>
          }
        />
      }
    >
      ---
    </PageWithHeader>
  );
}