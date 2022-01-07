import {
  LayoutOutlined,
  PartitionOutlined,
  SearchOutlined,
  ToolOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Divider, Input, Layout, Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useHttpClient } from '../../../admin/library/use-http-client';
import CrudReadComponent from '../../../content/component/read.component';
import WorkflowListComponent from '../../../flow/components/list.component';
import { IBlueprint } from '../../interface/blueprint.interface';

export default function ExtensionPanelWrapper() {
  const location = useLocation();
  const params: Partial<{ id: string }> = useParams();
  const base = `/admin/ext/${params.id}`;

  const [selectedMenu, setSelectedMenu] = useState([]);
  const [openedMenu, setOpenedMenu] = useState([]);

  const [{ data, loading, error }] = useHttpClient<IBlueprint>(
    `/api/rest/main/extension/${params.id}`,
  );

  useEffect(() => {
    if (location.pathname.match(`${base}/workflows`)) {
      setSelectedMenu(['workflows']);
      setOpenedMenu([]);
    }

    if (location.pathname.match(`${base}/pages`)) {
      setSelectedMenu(['pages']);
      setOpenedMenu([]);
    }

    if (location.pathname.match(`${base}/configs`)) {
      setSelectedMenu(['configs']);
      setOpenedMenu([]);
    }

    if (location.pathname.match(`${base}/contents`)) {
      setSelectedMenu(['contents']);
      setOpenedMenu(['contents']);

      if (data?.schemas) {
        for (const s of data.schemas) {
          const path = `${base}/contents/${s.database}/${s.reference}`;

          if (location.pathname.match(path)) {
            setSelectedMenu([s.reference]);
          }
        }
      }
    }
  }, [location.pathname, data]);

  return (
    <Layout hasSider>
      <Sider collapsible={false} width={200} className="h-screen">
        <div className="pt-2 -mb-2 px-2">
          <Input placeholder="Search content..." prefix={<SearchOutlined />} />
        </div>
        <Divider />
        <Menu
          className="menu -mt-2"
          theme="dark"
          selectedKeys={selectedMenu}
          openKeys={openedMenu}
          mode="inline"
        >
          <Menu.SubMenu
            key="contents"
            icon={<UnorderedListOutlined />}
            title="Contents"
            onTitleClick={() => setOpenedMenu(['contents'])}
          >
            {data
              ? data.schemas
                  .sort((a, b) => (a.title > b.title ? 1 : -1))
                  .map(s => (
                    <Menu.Item key={s.reference}>
                      <Link
                        to={`${base}/contents/${s.database}/${s.reference}`}
                      >
                        {s.title}
                      </Link>
                    </Menu.Item>
                  ))
              : undefined}
          </Menu.SubMenu>
          <Menu.Item key="workflows" icon={<PartitionOutlined />}>
            <Link to={`${base}/workflows`}>Workflows</Link>
          </Menu.Item>
          <Menu.Item key="pages" icon={<LayoutOutlined />}>
            Pages
          </Menu.Item>
          <Menu.Item key="configs" icon={<ToolOutlined />}>
            Configs
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Routes location={location}>
          <Route
            path={`${base}/workflows`}
            element={<WorkflowListComponent />}
          ></Route>
          <Route
            path={`${base}/contents/:database/:reference`}
            element={<CrudReadComponent />}
          ></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
