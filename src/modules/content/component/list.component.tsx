import { DatabaseOutlined, TableOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import cloneDeep from 'lodash.clonedeep';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { schemasAtom } from '../../admin/admin.atoms';
import PageHeader from '../../admin/layout/page-header.component';
import PageWithHeader from '../../admin/layout/page-with-header.component';
import { ISchema } from '../../schema';
import SchemaEditorComponent from '../../schema/component/editor.component';
import { fSchema } from '../../schema/util/filter-schema';
import TableComponent from './grid.component';
import TitleComponent from './title.components';

type RouteParams = {
  database: string;
  reference: string;
};

export default function ContentListComponent() {
  // Routing
  const route = useParams() as unknown as RouteParams;

  // Local state
  const [schema, setSchema] = useState<ISchema>(null);
  const [editSchema, setEditSchema] = useState<ISchema>(null);

  // Global state
  const [schemas, setSchemas] = useRecoilState(schemasAtom);

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
            actions={
              <Button
                icon={<DatabaseOutlined />}
                ghost
                onClick={() => setEditSchema(schema)}
              >
                Edit Schema
              </Button>
            }
          />
        }
      >
        {schema ? <TableComponent schema={schema} /> : undefined}
      </PageWithHeader>
      {editSchema && (
        <SchemaEditorComponent
          schema={schema}
          onClose={newSchema => {
            if (newSchema) {
              setSchemas(currentState => {
                const newState = cloneDeep(currentState);
                const idx = newState.findIndex(fSchema(newSchema));

                // Replace with the newSchema state
                if (idx !== -1) {
                  newState.splice(idx, 1, newSchema);
                }
                // Add new schema
                else {
                  newState.push(newSchema);
                }

                return newState;
              });
            }

            setEditSchema(null);
          }}
        />
      )}
    </ErrorBoundary>
  );
}
