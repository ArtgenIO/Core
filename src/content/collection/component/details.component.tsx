import { MenuUnfoldOutlined } from '@ant-design/icons';
import { PageHeader } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import Sider from 'antd/lib/layout/Sider';
import React from 'react';

export default function CollectionDetailsComponent() {
  return (
    <Sider
      width="380px"
      collapsible
      reverseArrow={true}
      collapsedWidth="0px"
      trigger={null}
      collapsed={false}
    >
      <ErrorBoundary>
        <PageHeader
          title={
            <span>
              <MenuUnfoldOutlined className="mr-2" /> Details
            </span>
          }
          ghost
        ></PageHeader>
        Det
      </ErrorBoundary>
    </Sider>
  );
}
