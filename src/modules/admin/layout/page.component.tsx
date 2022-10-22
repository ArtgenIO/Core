import { Layout } from 'antd';
import { Suspense } from 'react';
import AuthenticationWrapperComponent from '../../identity/component/wrapper.component';
import LoadingComponent from '../component/loading/loading.component.jsx';
import NavSide from './nav-side.component';
import PageContent from './page-content.component';

export default function PageComponent() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <AuthenticationWrapperComponent>
        <Layout className="h-screen">
          <NavSide />
          <Layout className="h-screen">
            <PageContent />
          </Layout>
        </Layout>
      </AuthenticationWrapperComponent>
    </Suspense>
  );
}
