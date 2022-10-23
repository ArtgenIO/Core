import { FileAddOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { lastViewedAtom, schemasAtom } from '../../admin/admin.atoms';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { ISchema } from '../../schema';
import GridComponent from './grid.component';
import TitleComponent from './title.components';

type RouteParams = {
  database: string;
  reference: string;
};

export default function ContentListComponent() {
  // Routing
  const route = useParams() as unknown as RouteParams;
  const setLastContent = useSetRecoilState(lastViewedAtom);
  const [isMissing, setIsMissing] = useState(false);

  // Local state
  const [schema, setSchema] = useState<ISchema>(null);
  const [triggerShowCreate, setTriggerShowCreate] = useState(false);

  // Global state
  const schemas = useRecoilValue(schemasAtom);

  useEffect(() => {
    if (schemas) {
      const current = schemas.find(
        s => s.database === route.database && s.reference === route.reference,
      );

      if (current) {
        setSchema(current);
        setLastContent([current.database, current.reference]);
      } else {
        setIsMissing(true);
      }
    }
  }, [route, schemas]);

  if (isMissing) {
    return (
      <Result
        status="error"
        className="mt-36"
        title="Schema does not exists"
        subTitle="Use the side explorer to navigate to existing and accessible schemas"
      ></Result>
    );
  }

  return (
    <>
      <PageWithHeader
        header={
          <PageHeader
            title={schema ? <TitleComponent schema={schema} /> : <>Loading</>}
            actions={
              <>
                <Button
                  icon={<FileAddOutlined />}
                  type="primary"
                  key="create"
                  onClick={() => setTriggerShowCreate(true)}
                  className="bg-gradient-to-r from-green-400 to-primary-600 border-midnight-800"
                >
                  Create New Record
                </Button>
              </>
            }
          />
        }
      >
        {schema ? (
          <GridComponent
            schema={schema}
            triggerShowCreate={triggerShowCreate}
            setTriggerShowCreate={setTriggerShowCreate}
          />
        ) : undefined}
      </PageWithHeader>
    </>
  );
}
