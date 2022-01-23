import { Layout } from 'antd';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ADMIN_URL } from '../admin.constants';
import Route404 from '../route/404.route';
import PageLoading from './page-loading.component';
import PageWrapper from './page-wrapper.component';

const { Content } = Layout;

export default function PageContent() {
  const Flow = lazy(() => import('../../flow/components/_router.component'));
  const Database = lazy(
    () => import('../../database/component/_router.component'),
  );
  const Contents = lazy(
    () => import('../../content/component/_router.component'),
  );
  const Apps = lazy(
    () => import('../../blueprint/component/_router.component'),
  );
  const Dashboard = lazy(() => import('../component/dashboard.component'));

  return (
    <Content className="overflow-y-auto overflow-x-hidden h-screen gray-scroll">
      <PageWrapper>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path={`${ADMIN_URL}`} element={<Dashboard />} />
            <Route path={`${ADMIN_URL}/flow/*`} element={<Flow />} />
            <Route path={`${ADMIN_URL}/database/*`} element={<Database />} />
            <Route path={`${ADMIN_URL}/content/*`} element={<Contents />} />
            <Route path={`${ADMIN_URL}/cloud-store/*`} element={<Apps />} />

            {/* Hygen insert routes above */}
            <Route path="*" element={<Route404 />} />
          </Routes>
        </Suspense>
      </PageWrapper>
    </Content>
  );
}
