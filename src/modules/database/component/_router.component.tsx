import { Layout } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { Navigate, Route, Routes } from 'react-router';
import { ADMIN_URL } from '../../admin/admin.constants';
import ArtboardWrapper from './artboard/wrapper.component';
import ImportSchemaComponent from './databases/import.component';
import DatabaseListComponent from './databases/list.component';
import DatabaseExplorerComponent from './_menu/explorer.component';
import ManagerMenuComponent from './_menu/manager.component';

export default function DatabaseRouterComponent() {
  const base = `${ADMIN_URL}/database`;

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <DatabaseExplorerComponent />
        <ManagerMenuComponent />
      </Sider>

      <Layout>
        <Routes>
          <Route path="databases" element={<DatabaseListComponent />}></Route>
          <Route path="artboard/:ref" element={<ArtboardWrapper />}></Route>
          <Route path="import" element={<ImportSchemaComponent />}></Route>
          <Route
            path="/"
            element={<Navigate to={`${base}/databases`} />}
          ></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
