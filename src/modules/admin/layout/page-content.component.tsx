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
  const Page = lazy(() => import('../../page/component/_router.component'));
  const Analytics = lazy(
    () => import('../../analytics/component/_index.component'),
  );

  const Develop = lazy(() => import('../component/develop/_router.component'));
  const FormRouter = lazy(
    () => import('../../form/component/_router.component'),
  );

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
            <Route path={`${ADMIN_URL}/page/*`} element={<Page />} />
            <Route path={`${ADMIN_URL}/form/*`} element={<FormRouter />} />
            <Route path={`${ADMIN_URL}/analytics/*`} element={<Analytics />} />
            <Route path={`${ADMIN_URL}/develop/*`} element={<Develop />} />

            {/* Hygen insert routes above */}
            <Route path="*" element={<Route404 />} />
          </Routes>
        </Suspense>
      </PageWrapper>
    </Content>
  );
}
