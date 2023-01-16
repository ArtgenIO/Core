import { Layout, Spin } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { Suspense } from 'react';
import { generatePath, Route, Routes, useNavigate } from 'react-router';
import FavoriteSchemasComponent from '../database/schema/favorites.component';
import SchemaTreeComponent from '../database/schema/tree.component';
import ContentListComponent from './list.component';
import PlaceholderComponent from './placeholder.component';

export default function ContentRouterComponent() {
  const navigate = useNavigate();

  const onSchemaSelect = (key: string | null) => {
    if (key) {
      const [db, ref] = key.toString().split('$');
      const path =
        generatePath('/content/:db/:ref', {
          db,
          ref,
        }) + '?page=1';

      if (path != window.location.href) {
        navigate(path);
      }
    }
  };

  return (
    <Layout hasSider>
      <Sider
        width={220}
        theme="light"
        className="h-screen depth-2 overflow-auto gray-scroll "
      >
        <Suspense fallback={<Spin />}>
          <FavoriteSchemasComponent />
          <SchemaTreeComponent onSelect={onSchemaSelect} />
        </Suspense>
      </Sider>

      <Layout>
        <Routes>
          <Route
            path=":database/:reference"
            element={<ContentListComponent />}
          ></Route>
          <Route path="/" element={<PlaceholderComponent />}></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
