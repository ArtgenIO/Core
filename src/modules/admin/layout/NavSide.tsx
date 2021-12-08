import {
  AppstoreOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Layout, Menu, notification } from 'antd';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';
import { IBlueprint } from '../../blueprint/interface/extension.interface';
import { routeCrudAPI } from '../../content/util/schema-url';
import { jwtAtom } from '../admin.atoms';
import { useHttpClient } from '../library/use-http-client';
import './NavSide.css';

const ADMIN_BASE_URL = '/admin';
const { Sider } = Layout;

type IMenuItem = {
  icon: React.ReactNode;
  title: string;
  to: string;
};

const menuItems: IMenuItem[] = [
  {
    icon: <HomeOutlined />,
    to: ADMIN_BASE_URL,
    title: 'Dashboard',
  },
  {
    icon: <DatabaseOutlined />,
    to: ADMIN_BASE_URL + '/database',
    title: 'Databases',
  },
  {
    icon: <AppstoreOutlined />,
    title: 'Extension Store',
    to: ADMIN_BASE_URL + '/ext/store',
  },
];

const NavSide = () => {
  const location = useLocation();
  const resetJwt = useResetRecoilState(jwtAtom);
  const [selected, setSelected] = useState('');
  const [menus, setMenus] = useState<IMenuItem[]>([]);

  const [{ data: extensions, loading, error }] = useHttpClient<IBlueprint[]>(
    routeCrudAPI({
      database: 'main',
      reference: 'Extension',
    }) +
      new QueryBuilder()
        .select('id,title,icon')
        .top(100)
        .orderBy('title')
        .toQuery(),
  );

  useEffect(() => {
    if (extensions) {
      setMenus([
        menuItems[0],
        ...extensions.map(
          ext =>
            ({
              icon: (
                <span key="primary" className="material-icons-outlined">
                  {ext.icon ?? 'widgets'}
                </span>
              ),
              title: ext.title,
              to: `${ADMIN_BASE_URL}/ext/${ext.id}`,
            } as IMenuItem),
        ),
        ...menuItems.slice(1),
      ]);
    }
  }, [extensions]);

  useEffect(() => {
    let longestMatch = 0;
    let tempSelected = '';

    for (const menu of menus) {
      if (location.pathname.match(menu.to)) {
        if (longestMatch < menu.to.length) {
          longestMatch = menu.to.length;
          tempSelected = `k-${menu.to}`;
        }
      }
    }

    setSelected(tempSelected);
  }, [menus, location]);

  return (
    <Sider collapsed className="left-nav relative" collapsedWidth={54}>
      <div className="brand-block">
        <Link to={ADMIN_BASE_URL}>
          <div className="brand-logo"></div>
        </Link>
      </div>

      {loading ? undefined : (
        <Menu
          className="menu"
          theme="dark"
          defaultSelectedKeys={[selected]}
          mode="inline"
        >
          {menus.map(menu => (
            <Menu.Item key={`k-${menu.to}`} icon={menu.icon}>
              <Link to={menu.to}>{menu.title}</Link>
            </Menu.Item>
          ))}
        </Menu>
      )}

      <div className="w-full absolute bottom-0" style={{ bottom: 4 }}>
        <Menu theme="dark" mode="inline">
          <Menu.Item
            key="profile"
            icon={<LogoutOutlined />}
            onClick={() => {
              resetJwt();

              notification.success({
                message: 'Bye bye! Come back soon <3',
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
