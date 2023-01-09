import { Result } from 'antd';
import { useEffect } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SchemaRef } from '../../../types/system-ref.enum';
import { lastViewedAtom, schemasAtom } from '../../atoms/admin.atoms';

export default function PlaceholderComponent() {
  const schemas = useRecoilValue(schemasAtom);
  const lastViewed = useRecoilValue(lastViewedAtom);
  const navigate = useNavigate();

  useEffect(() => {
    let db: string;
    let ref: string;

    // Show last viewed schemas, if exists :v
    if (
      lastViewed &&
      schemas.find(
        s => s.database === lastViewed[0] && s.reference === lastViewed[1],
      )
    ) {
      [db, ref] = lastViewed;
    }
    // Show the first favorite scheam
    else if (schemas.some(s => s.meta.isFavorite)) {
      const fav = schemas.find(s => s.meta.isFavorite);
      db = fav.database;
      ref = fav.reference;
    }
    // Modules as default
    else {
      db = 'main';
      ref = SchemaRef.MODULE;
    }

    navigate(generatePath('/content/:db/:ref', { db, ref }) + '?page=1');
  });

  return (
    <Result status="success" title="Redirecting to a schema view..."></Result>
  );
}
