import { DatabaseOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Tree, TreeDataNode } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { useEffect, useState } from 'react';
import {
  generatePath,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router';
import { useRecoilValue } from 'recoil';
import { databasesAtom, schemasAtom } from '../../admin/admin.atoms';
import { ADMIN_URL } from '../../admin/admin.constants';
import MenuBlock from '../../admin/component/menu-block.component';
import ArtboardWrapper from './artboard/wrapper.component';
import DatabaseListComponent from './databases/list.component';
import ManagerMenuComponent from './_menu/manager.component';

export default function DatabaseRouterComponent() {
  const base = `${ADMIN_URL}/database`;
  const [tree, setTree] = useState<TreeDataNode[]>([]);
  const [selected, setSelected] = useState([]);

  // Routing
  const navigate = useNavigate();

  // Global states
  const databases = useRecoilValue(databasesAtom);
  const schemas = useRecoilValue(schemasAtom);

  useEffect(() => {
    if (databases) {
      setTree(
        databases.map(db => ({
          title: db.title,
          key: db.ref,
          children: schemas
            .filter(s => s.database === db.ref)
            .map(s => ({
              title: s.title,
              key: `${db.ref}-${s.reference}`,
              isLeaf: true,
            })) as TreeDataNode[],
          className: 'test--db-list-ref',
          icon: <DatabaseOutlined />,
          isLeaf: false,
          selectable: true,
        })),
      );
    }
  }, [schemas, databases]);

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock
          title="Database Explorer"
          className="-mb-1"
          style={{ borderTop: 0 }}
        >
          <div className="px-2 py-2">
            <Input
              placeholder="Schemantic Search..."
              prefix={<SearchOutlined />}
              size="small"
            />
          </div>
          <Divider className="my-0" />

          {tree.length ? (
            <Tree.DirectoryTree
              treeData={tree}
              defaultExpandAll
              selectedKeys={selected}
              onSelect={selected => {
                if (selected.length) {
                  const [ref, sch] = selected[0].toString().split('-');
                  const path = generatePath(
                    `/admin/database/artboard/:ref?schema=${sch}`,
                    {
                      ref,
                    },
                  );

                  navigate(path);
                }

                setSelected(selected);
              }}
            />
          ) : undefined}
        </MenuBlock>
        <ManagerMenuComponent />
      </Sider>

      <Layout>
        <Routes>
          <Route path="databases" element={<DatabaseListComponent />}></Route>
          <Route path="artboard/:ref" element={<ArtboardWrapper />}></Route>
          <Route
            path="/"
            element={<Navigate to={`${base}/databases`} />}
          ></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
