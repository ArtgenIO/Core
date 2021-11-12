import { FileAddOutlined } from '@ant-design/icons';
import { Button, Input, Tabs } from 'antd';
import { Link } from 'react-router-dom';
import { v4 } from 'uuid';
import PageHeader from '../../../management/backoffice/layout/PageHeader';
import PageWithHeader from '../../../management/backoffice/layout/PageWithHeader';

export default function AnalyticsEditorComponent() {
  return (
    <PageWithHeader
      header={
        <PageHeader
          title="Analytics Wizard"
          actions={
            <Link key="save" to={`/backoffice/analytics/${v4()}/editor`}>
              <Button type="primary" icon={<FileAddOutlined />}>
                Save
              </Button>
            </Link>
          }
        />
      }
    >
      <div className="content-box px-8 py-8" style={{ minHeight: 600 }}>
        <div className="flex">
          <div className="flex-grow">
            <Tabs size="large" tabPosition="left" defaultActiveKey="formula">
              <Tabs.TabPane key="appearance" tab="Appearance">
                <Input
                  size="large"
                  placeholder="Product sold in the past week"
                />
              </Tabs.TabPane>
              <Tabs.TabPane key="formula" tab="Formula"></Tabs.TabPane>
            </Tabs>
          </div>
          <div className="w-1/2 pl-8">Outcome</div>
        </div>
      </div>
    </PageWithHeader>
  );
}
