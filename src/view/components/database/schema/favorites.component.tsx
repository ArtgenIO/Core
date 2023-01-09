import { StarFilled } from '@ant-design/icons';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { schemasAtom } from '../../../atoms/admin.atoms';
import MenuBlock from '../../../layout/menu-block.component';

export default function FavoriteSchemasComponent() {
  const navigate = useNavigate();
  const schemas = useRecoilValue(schemasAtom);

  // Favorites are hidden until at least one is added
  if (!schemas?.some(s => s?.meta?.isFavorite)) {
    return <></>;
  }

  return (
    <MenuBlock title="Favorite Content" style={{ borderTop: 0 }}>
      <Menu
        className="compact"
        selectable={false}
        items={schemas
          .filter(s => !!s?.meta?.isFavorite)
          .map(s => ({
            key: s.reference,
            icon: <StarFilled />,
            title: s.title,
            label: s.title,
            onClick: () => navigate(`/content/${s.database}/${s.reference}`),
          }))}
      />
    </MenuBlock>
  );
}
