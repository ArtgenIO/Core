import {
  AppstoreOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LayoutOutlined,
  PartitionOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu, notification } from 'antd';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { jwtAtom, pageNavCollapseAtom } from '../admin.atoms';
import './NavSide.css';

const ADMIN_BASE_URL = '/admin';
const { Sider } = Layout;

type ISubMenuItem = {
  icon: React.ReactNode;
  label: string;
  to: string;
};

type IMenuItem = {
  icon: React.ReactNode;
  label: string;
  children?: ISubMenuItem[];
  to?: string;
};

const menuItems: IMenuItem[] = [
  {
    icon: <HomeOutlined />,
    to: ADMIN_BASE_URL,
    label: 'Dashboard',
  },
  {
    icon: <UnorderedListOutlined />,
    to: ADMIN_BASE_URL + '/content',
    label: 'Content',
  },
  // {
  // icon: <PieChartOutlined />,
  // to: ADMIN_BASE_URL + '/analytics',
  // label: 'Analytics',
  // },
  {
    icon: <PartitionOutlined />,
    to: ADMIN_BASE_URL + '/workflow',
    label: 'Workflows',
  },
  {
    icon: <DatabaseOutlined />,
    to: ADMIN_BASE_URL + '/database',
    label: 'Databases',
  },
  {
    icon: <LayoutOutlined />,
    to: ADMIN_BASE_URL + '/page',
    label: 'Pages',
  },
  {
    icon: <UserOutlined />,
    label: 'Users',
    to: ADMIN_BASE_URL + '/content/system/Account',
  },
  {
    icon: <AppstoreOutlined />,
    label: 'Extensions',
    to: ADMIN_BASE_URL + '/extension',
  },
];

const NavSide = () => {
  const [menuCollapse, setMenuCollapse] = useRecoilState(pageNavCollapseAtom);
  const location = useLocation();
  const resetJwt = useResetRecoilState(jwtAtom);
  let selected = 'm0';
  let opened = '';
  let longestMatch = 0;

  for (const [k1, menu1] of menuItems.entries()) {
    if (location.pathname.match(menu1.to)) {
      if (menu1.to) {
        if (longestMatch < menu1.to.length) {
          longestMatch = menu1.to.length;
          selected = `m${k1}`;
        }
      }
    }

    if (menu1.children) {
      for (const [k2, menu2] of menu1.children.entries()) {
        if (location.pathname.match(menu2.to)) {
          if (longestMatch < menu2.to.length) {
            longestMatch = menu2.to.length;
            selected = `m${k1}.${k2}`;
            opened = `s${k1}`;
          }
        }
      }
    }
  }

  if (menuCollapse) {
    opened = '';
  }

  return (
    <Sider
      collapsible={false}
      collapsed={true}
      onCollapse={() => setMenuCollapse(!menuCollapse)}
      width={240}
      className="left-nav relative"
      collapsedWidth={54}
    >
      <div className="flex flex-row brand-block">
        <div>
          <Link to={ADMIN_BASE_URL}>
            <div className="brand-logo"></div>
          </Link>
        </div>
        <div className={'brand-name ' + (menuCollapse ? 'hidden' : 'block')}>
          artgen
        </div>
      </div>
      <Menu
        key="menus"
        className="menu"
        theme="dark"
        defaultSelectedKeys={[selected]}
        defaultOpenKeys={[opened]}
        mode="inline"
        triggerSubMenuAction="hover"
      >
        {menuItems.map((menu1, key1) => {
          return menu1?.to ? (
            <Menu.Item key={`m${key1}`} icon={menu1.icon}>
              <Link to={menu1.to}>{menu1.label}</Link>{' '}
            </Menu.Item>
          ) : menu1.children ? (
            <Menu.SubMenu
              key={`s${key1}`}
              icon={menu1.icon}
              title={menu1.label}
            >
              {menu1.children.map((menu2, key2) => (
                <Menu.Item key={`m${key1}.${key2}`} icon={menu2.icon}>
                  <Link to={menu2.to}>{menu2.label}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          ) : undefined;
        })}
      </Menu>

      <div
        key="bottom-menus"
        className="w-full absolute bottom-0"
        style={{ bottom: 4 }}
      >
        <Menu key="user-menu" theme="dark" mode="inline">
          <Menu.Item
            key={`profile`}
            icon={
              <span className="material-icons-outlined ">account_circle</span>
            }
            onClick={() => {
              resetJwt();

              notification.success({
                message: 'Bye bye! Come back soon <3',
                duration: 5,
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
