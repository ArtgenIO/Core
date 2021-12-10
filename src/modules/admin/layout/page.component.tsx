import { Layout } from 'antd';
import AuthenticationWrapperComponent from '../../identity/component/wrapper.component';
import NavSide from './nav-side.component';
import PageContent from './page-content.component';
import PageDrawer from './page-drawer.component';

export default function PageComponent() {
  return (
    <AuthenticationWrapperComponent>
      <Layout className="h-screen">
        <NavSide />
        <Layout className="h-screen">
          <PageContent />
        </Layout>
        <PageDrawer />
      </Layout>
    </AuthenticationWrapperComponent>
  );
}
