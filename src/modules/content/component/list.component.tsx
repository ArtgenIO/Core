import { TableOutlined } from '@ant-design/icons';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { schemasAtom } from '../../admin/admin.atoms';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { ISchema } from '../../schema';
import TableComponent from './grid.component';
import TitleComponent from './title.components';

type RouteParams = {
  database: string;
  reference: string;
};

export default function ContentListComponent() {
  const route = useParams() as unknown as RouteParams;
  const [schema, setSchema] = useState<ISchema>(null);
  const schemas = useRecoilValue(schemasAtom);

  useEffect(() => {
    if (schemas) {
      setSchema(
        schemas.find(
          s => s.database === route.database && s.reference === route.reference,
        ),
      );
    }
  }, [route, schemas]);

  return (
    <ErrorBoundary>
      <PageWithHeader
        header={
          <PageHeader
            title={schema ? <TitleComponent schema={schema} /> : <>Loading</>}
            avatar={{
              icon: <TableOutlined />,
            }}
          />
        }
      >
        {schema ? <TableComponent schema={schema} /> : undefined}
      </PageWithHeader>
    </ErrorBoundary>
  );
}
