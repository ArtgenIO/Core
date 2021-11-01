import { Layout } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import '../assets/antd.less';
import '../assets/main.css';
import NavSide from '../layout/NavSide';
import PageContent from '../layout/PageContent';
import PageDrawer from '../layout/PageDrawer';

export default function Root() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Layout className="h-screen">
          <NavSide />
          <Layout className="h-screen">
            <PageContent />
          </Layout>
          <PageDrawer />
        </Layout>
      </BrowserRouter>
    </RecoilRoot>
  );
}
