import { Menu } from 'antd';
import { useEffect, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import Icon from '../../../admin/component/icon.component';
import MenuBlock from '../../../admin/component/menu-block.component';

type IMenuItem = {
  key: string;
  icon: string;
  title: string;
  path: string;
};

const elements: IMenuItem[] = [
  {
    key: 'databases',
    icon: 'subject',
    title: 'Databases',
    path: 'databases',
  },
  {
    key: 'import',
    icon: 'upload_file',
    title: 'Import Schema',
    path: 'import',
  },
];

export default function ManagerMenuComponent() {
  const location = useLocation();
  const base = `/database`;
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected([]);

    for (const e of elements) {
      const isRouted = matchPath(location.pathname, `${base}/${e.path}`);

      if (isRouted) {
        setSelected([e.key]);
        break;
      }
    }
  }, [location]);

  return (
    <MenuBlock title="Database Manager">
      <Menu className="compact" selectedKeys={selected}>
        {elements.map(e => (
          <Menu.Item key={e.key} icon={<Icon id={e.icon} />}>
            <Link to={e.path}>{e.title}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </MenuBlock>
  );
}
