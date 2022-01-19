import {
  DatabaseOutlined,
  FileOutlined,
  HomeOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Spin } from 'antd';
import { snakeCase } from 'lodash';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MeButtonComponent from '../../identity/component/me-button.component';
import NewsComponent from '../../upgrade/component/news.component';
import { ADMIN_URL } from '../admin.constants';
import './nav-side.component.less';

const { Sider } = Layout;

type IMenuItem = {
  icon: ReactNode;
  title: string;
  path: string;
};

const menuItems: IMenuItem[] = [
  {
    icon: <HomeOutlined />,
    path: ADMIN_URL,
    title: 'Dashboard',
  },
  {
    icon: <FileOutlined />,
    path: ADMIN_URL + '/content',
    title: 'Content',
  },
  {
    icon: <PartitionOutlined />,
    path: ADMIN_URL + '/flow',
    title: 'Flow',
  },
  {
    icon: <DatabaseOutlined />,
    path: ADMIN_URL + '/database',
    title: 'Databases',
  },
];

const matcher = menuItems
  .map(m => ({ path: m.path, key: `k-${snakeCase(m.title)}` }))
  .sort((a, b) => (a.path.length < b.path.length ? 1 : -1));

const NavSide = () => {
  const location = useLocation();
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
    <>
      <Sider
        collapsed
        className="nav-side depth-1 relative"
        collapsedWidth={54}
      >
        <div className="brand-block">
          <Link to={ADMIN_URL}>
            <div className="brand-logo"></div>
          </Link>
        </div>

        {selected ? (
          <Menu className="menu" defaultSelectedKeys={selected} mode="inline">
            {menuItems.map(menu => (
              <Menu.Item key={`k-${snakeCase(menu.title)}`} icon={menu.icon}>
                <Link to={menu.path}>{menu.title}</Link>
              </Menu.Item>
            ))}
          </Menu>
        ) : undefined}

        <Suspense fallback={<Spin></Spin>}>
          <NewsComponent />
          <MeButtonComponent />
        </Suspense>
      </Sider>
    </>
  );
};

export default NavSide;
