import { Layout } from 'antd';
import AuthenticationWrapperComponent from '../../authentication/component/wrapper.component';
import NavSide from './NavSide';
import PageContent from './PageContent';
import PageDrawer from './PageDrawer';

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
