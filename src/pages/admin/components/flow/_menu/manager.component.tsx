import { Menu } from 'antd';
import { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../layout/icon.component';
import MenuBlock from '../../../layout/menu-block.component';

type IMenuItem = {
  key: string;
  icon: string;
  title: string;
  path: string;
};

const elements: IMenuItem[] = [
  {
    key: 'flows',
    icon: 'table_rows',
    title: 'Flows',
    path: 'list',
  },
];

export default function ManagerMenuComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const base = `/flow`;
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
    <MenuBlock title="Flow Manager">
      <Menu
        className="compact"
        selectedKeys={selected}
        items={elements.map(e => ({
          key: e.key,
          icon: <Icon id={e.icon} />,
          title: e.title,
          label: e.title,
          onClick: () => navigate(`${base}/${e.path}`),
        }))}
      />
    </MenuBlock>
  );
}
