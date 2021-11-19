import { Layout } from 'antd';
import { useRecoilValue } from 'recoil';
import AuthenticationCoverComponent from '../../authentication/component/cover.component';
import { jwtAtom } from '../admin.atoms';
import '../assets/antd.less';
import '../assets/main.css';
import NavSide from './NavSide';
import PageContent from './PageContent';
import PageDrawer from './PageDrawer';

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
