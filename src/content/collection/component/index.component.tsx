import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router';
import { useSetRecoilState } from 'recoil';
import { breadcrumbsAtom } from '../../../management/backoffice/backoffice.atoms';
import { useHttpClient } from '../../../management/backoffice/library/http-client';
import { collectionsAtom } from '../collection.atoms';
import { ICollection } from '../interface/collection.interface';
import CollectionEditorComponent from './edit.component';
import CollectionListComponent from './list.component';

export default function CollectionIndexComponent() {
  const location = useLocation();
  const setCollections = useSetRecoilState(collectionsAtom);
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);
  const httpClient = useHttpClient();

  useEffect(() => {
    httpClient
      .get<ICollection[]>('/api/$system/content/collection')
      .then(response => {
        setCollections(() => response.data);
      });

    setBreadcrumb(routes =>
      routes.concat({
        breadcrumbName: 'Collections',
        path: 'content/collections',
      }),
    );

    return () => {
      setBreadcrumb(routes => routes.slice(0, routes.length - 1));
    };
  }, [location]);

  return (
    <>
      <Switch location={location}>
        <Route
          exact
          path="/backoffice/content/collection"
          component={CollectionListComponent}
        />
        <Route
          exact
          path="/backoffice/content/collection/:reference"
          component={CollectionEditorComponent}
        />
      </Switch>
    </>
  );
}
