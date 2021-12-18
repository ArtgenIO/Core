import {
  BarsOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { Layout, Menu, notification } from 'antd';
import { snakeCase } from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';
import { jwtAtom } from '../admin.atoms';
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
    icon: <BarsOutlined />,
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
  const resetJwt = useResetRecoilState(jwtAtom);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);

    for (const m of matcher) {
      if (location.pathname.match(m.path)) {
        setSelected([m.key]);
        break;
      }
    }
  }, [location]);

  return (
    <Sider collapsed className="nav-side depth-1 relative" collapsedWidth={54}>
      <div className="brand-block">
        <Link to={ADMIN_URL}>
          <div className="brand-logo"></div>
        </Link>
      </div>

      {selected.length ? (
        <Menu className="menu" defaultSelectedKeys={selected} mode="inline">
          {menuItems.map(menu => (
            <Menu.Item key={`k-${snakeCase(menu.title)}`} icon={menu.icon}>
              <Link to={menu.path}>{menu.title}</Link>
            </Menu.Item>
          ))}
        </Menu>
      ) : undefined}

      <div className="w-full absolute bottom-0">
        <Menu mode="inline">
          <Menu.Item
            key="profile"
            icon={<LogoutOutlined />}
            onClick={() => {
              resetJwt();

              notification.success({
                message: 'Bye bye! Come back soon <3',
                placement: 'bottomRight',
              });
            }}
            className="test--sign-out"
          >
            Sign Out
          </Menu.Item>
        </Menu>
      </div>
    </Sider>
  );
};

export default NavSide;
