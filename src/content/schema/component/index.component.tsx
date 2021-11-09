import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router';
import { useSetRecoilState } from 'recoil';
import { ISchema } from '..';
import { useHttpClientOld } from '../../../management/backoffice/library/http-client';
import { schemasAtom } from '../schema.atoms';
import CreateSchemaComponent from './create.component';
import SchemaEditorComponent from './edit.component';
import SchemaListComponent from './list.component';
import NewSchemaComponent from './new.component';

export default function SchemaIndexComponent() {
  const location = useLocation();
  const setSchemas = useSetRecoilState(schemasAtom);
  const httpClient = useHttpClientOld();

  useEffect(() => {
    httpClient.get<ISchema[]>('/api/$system/content/schema').then(response => {
      setSchemas(() => response.data);
    });

    return () => {};
  }, [location]);

  return (
    <>
      <Switch location={location}>
        <Route
          exact
          path="/backoffice/content/schema"
          component={SchemaListComponent}
        />
        <Route
          exact
          path="/backoffice/content/schema/new"
          component={NewSchemaComponent}
        />
        <Route
          exact
          path="/backoffice/content/schema/create"
          component={CreateSchemaComponent}
        />
        <Route
          exact
          path="/backoffice/content/schema/:database/:reference"
          component={SchemaEditorComponent}
        />
      </Switch>
    </>
  );
}
