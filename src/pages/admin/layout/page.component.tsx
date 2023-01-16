import { Layout } from 'antd';
import { Suspense } from 'react';
import AuthenticationWrapperComponent from '../components/identity/wrapper.component';
import LoadingComponent from './loading/loading.component.jsx';
import PageContent from './page-content.component';
import SideNav from './side-nav.component';

export default function PageComponent() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <AuthenticationWrapperComponent>
        <Layout className="h-screen">
          <SideNav />
          <PageContent />
        </Layout>
      </AuthenticationWrapperComponent>
    </Suspense>
  );
}
