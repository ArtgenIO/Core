import { Layout } from 'antd';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingComponent from '../component/loading/loading.component.jsx';
import Route404 from '../route/404.route';

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
      <Suspense fallback={<LoadingComponent />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/flow/*" element={<Flow />} />
          <Route path="/database/*" element={<Database />} />
          <Route path="/content/*" element={<Contents />} />
          <Route path="/cloud-store/*" element={<Apps />} />
          <Route path="/page/*" element={<Page />} />
          <Route path="/form/*" element={<FormRouter />} />
          <Route path="/analytics/*" element={<Analytics />} />
          <Route path="/develop/*" element={<Develop />} />

          <Route path="/sign-in" element={<Navigate to="/" />} />
          <Route path="/sign-up" element={<Navigate to="/" />} />

          <Route path="*" element={<Route404 />} />
        </Routes>
      </Suspense>
    </Content>
  );
}
