import {
  AppstoreOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  FunnelPlotOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  PartitionOutlined,
  ProfileOutlined,
  SettingOutlined,
  SlidersOutlined,
  TableOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu, message } from 'antd';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { jwtAtom, pageNavCollapseAtom } from '../backoffice.atoms';
import './NavSide.css';

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
    to: '/backoffice',
    label: 'Dashboard',
  },
  {
    icon: <ProfileOutlined />,
    label: 'Content',
    children: [
      {
        icon: <UnorderedListOutlined />,
        to: '/backoffice/content/crud',
        label: 'CRUD Manager',
      },
      {
        icon: <BarChartOutlined />,
        to: '/backoffice/content/analytics',
        label: 'Analytics',
      },
      {
        icon: <TableOutlined />,
        to: '/backoffice/content/schema',
        label: 'Schema Manager',
      },
    ],
  },
  {
    icon: <SlidersOutlined />,
    label: 'Management',
    children: [
      {
        icon: <PartitionOutlined />,
        to: '/backoffice/management/workflow',
        label: 'Workflows',
      },
      {
        icon: <FunnelPlotOutlined />,
        to: '/backoffice/missing-page-replace-this',
        label: 'State Machines',
      },
      {
        icon: <TagsOutlined />,
        to: '/backoffice/missing-page-replace-this',
        label: 'Tag Engine',
      },
      {
        icon: <FileProtectOutlined />,
        to: '/backoffice/missing-page-replace-this',
        label: 'Credentials',
      },
    ],
  },
  {
    icon: <SettingOutlined />,
    label: 'System',
    children: [
      {
        icon: <UserOutlined />,
        label: 'User Management',
        to: '/backoffice',
      },
      {
        icon: <LockOutlined />,
        label: 'Access Control',
        to: '/backoffice/auth/signup',
      },
      {
        icon: <DatabaseOutlined />,
        to: '/backoffice/content/databases',
        label: 'Databases',
      },
    ],
  },
  {
    icon: <AppstoreOutlined />,
    label: 'Plugins',
    to: '/backoffice',
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
      collapsible
      collapsed={menuCollapse}
      onCollapse={() => setMenuCollapse(!menuCollapse)}
      width={240}
      className="left-nav relative"
      collapsedWidth={54}
    >
      <div className="flex flex-row brand-block">
        <div>
          <Link to="/backoffice">
            <div className="brand-logo"></div>
          </Link>
        </div>
        <div className={'brand-name ' + (menuCollapse ? 'hidden' : 'block')}>
          Artgen
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
        style={{ bottom: 48 }}
      >
        <Menu key="user-menu" theme="dark" mode="inline">
          <Menu.Item
            key={`profile`}
            icon={<LogoutOutlined />}
            onClick={() => {
              resetJwt();
              message.info('Bye bye! Come back soon <3');
            }}
          >
            Sign Out
          </Menu.Item>
        </Menu>
      </div>
    </Sider>
  );
};

export default NavSide;
