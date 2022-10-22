import { Layout, Spin } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { Suspense } from 'react';
import { generatePath, Route, Routes, useNavigate } from 'react-router';
import MenuBlock from '../../admin/component/menu-block.component';
import FavoriteSchemasComponent from '../../schema/component/favorites.component';
import SchemaTreeComponent from '../../schema/component/tree.component';
import ContentListComponent from './list.component';
import PlaceholderComponent from './placeholder.component';

export default function ContentRouterComponent() {
  const navigate = useNavigate();

  const onSchemaSelect = (key: string | null) => {
    if (key) {
      const [db, ref] = key.toString().split('$');
      const path = generatePath('/content/:db/:ref?page=1', {
        db,
        ref,
      });

      if (path != window.location.href) {
        navigate(path);
      }
    }
  };

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <Suspense fallback={<Spin />}>
          <FavoriteSchemasComponent />
          <SchemaTreeComponent onSelect={onSchemaSelect} />
          <MenuBlock title="Content Transactions"></MenuBlock>
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
