import {
  CloudOutlined,
  DatabaseOutlined,
  FileOutlined,
  HomeOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Layout, Menu, Spin } from 'antd';
import snakeCase from 'lodash.snakecase';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MeButtonComponent from '../components/identity/me-button.component';
import NewsComponent from '../components/upgrade/news.component';
import './side-nav.component.less';

const { Sider } = Layout;

type IMenuItem = {
  className: string;
  icon: ReactNode;
  title: string;
  path: string;
};

const menuItems: IMenuItem[] = [
  {
    icon: <HomeOutlined />,
    path: '',
    title: 'Dashboard',
    className: 'test--nav-dashboard',
  },
  {
    icon: <FileOutlined />,
    path: '/content',
    title: 'Content',
    className: 'test--nav-content',
  },
  {
    icon: <PartitionOutlined />,
    path: '/flow',
    title: 'Flow',
    className: 'test--nav-flow',
  },

  {
    icon: <DatabaseOutlined />,
    path: '/database',
    title: 'Databases',
    className: 'test--nav-database',
  },

  {
    icon: <CloudOutlined />,
    path: '/cloud-store',
    title: 'Cloud Store',
    className: 'test--nav-store',
  },
];

const matcher = menuItems
  .map(m => ({ path: m.path, key: `k-${snakeCase(m.title)}` }))
  .sort((a, b) => (a.path.length < b.path.length ? 1 : -1));

const SideNav = () => {
  const location = useLocation();
  const navigateTo = useNavigate();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected([]);

    for (const m of matcher) {
      if (location.pathname.match(m.path)) {
        setSelected([m.key]);
        break;
      }
    }

    return () => {
      setSelected(null);
    };
  }, [location]);

  return (
    <Sider collapsed className="nav-side relative" collapsedWidth={54}>
      <div className="brand-block">
        <Link to="/">
          <div className="brand-logo"></div>
        </Link>
      </div>

      {selected && (
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                colorBorder: 'red',
              },
            },
          }}
        >
          <Menu
            className="menu !bg-transparent !border-0"
            defaultSelectedKeys={selected}
            theme="dark"
            mode="inline"
            items={menuItems.map(m => ({
              key: `k-${snakeCase(m.title)}`,
              icon: m.icon,
              title: m.title,
              onClick: () => navigateTo(m.path),
              className: m.className,
            }))}
          />
        </ConfigProvider>
      )}

      <Suspense fallback={<Spin></Spin>}>
        <NewsComponent />
        <MeButtonComponent />
      </Suspense>
    </Sider>
  );
};

export default SideNav;
