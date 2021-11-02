import { Layout } from 'antd';
import { useRecoilValue } from 'recoil';
import AuthenticationCoverComponent from '../../../system/security/authentication/component/cover.component';
import '../assets/antd.less';
import '../assets/main.css';
import { jwtAtom } from '../backoffice.atoms';
import NavSide from '../layout/NavSide';
import PageContent from '../layout/PageContent';
import PageDrawer from '../layout/PageDrawer';

export default function PageComponent() {
  const jwt = useRecoilValue(jwtAtom);

  return (
    <>
      {jwt ? (
        <Layout className="h-screen">
          <NavSide />
          <Layout className="h-screen">
            <PageContent />
          </Layout>
          <PageDrawer />
        </Layout>
      ) : (
        <AuthenticationCoverComponent />
      )}
    </>
  );
}
