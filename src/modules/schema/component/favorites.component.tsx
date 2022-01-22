import { StarOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { schemasAtom } from '../../admin/admin.atoms';
import MenuBlock from '../../admin/component/menu-block.component';

export default function FavoriteSchemasComponent() {
  const schemas = useRecoilValue(schemasAtom);

  if (
    !schemas ||
    !schemas.length ||
    !schemas.some(s => !!s?.meta?.isFavorite)
  ) {
    return <></>;
  }

  return (
    <MenuBlock title="Favorite Content">
      <Menu className="compact" selectable={false}>
        {schemas
          .filter(s => !!s?.meta?.isFavorite)
          .map(schema => (
            <Menu.Item key={schema.reference} icon={<StarOutlined />}>
              <Link
                to={`/admin/content/${schema.database}/${schema.reference}`}
              >
                {schema.title}
              </Link>
            </Menu.Item>
          ))}
      </Menu>
    </MenuBlock>
  );
}
