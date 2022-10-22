import { Result } from 'antd';
import { useEffect } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { lastViewedAtom, schemasAtom } from '../../admin/admin.atoms';
import { SchemaRef } from '../../schema/interface/system-ref.enum';

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

    navigate(generatePath('/content/:db/:ref?page=1', { db, ref }));
  });

  return (
    <Result status="success" title="Redirecting to a schema view..."></Result>
  );
}
