import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router';
import { useSetRecoilState } from 'recoil';
import { breadcrumbsAtom } from '../../../management/backoffice/backoffice.atoms';
import DatabaseAddComponent from './add.component';
import DatabaseListComponent from './list.component';

export default function DatabaseIndexComponent() {
  const location = useLocation();
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);

  useEffect(() => {
    setBreadcrumb(routes =>
      routes.concat({
        breadcrumbName: 'Databases',
        path: 'system/database',
      }),
    );

    return () => {
      setBreadcrumb(routes => routes.slice(0, routes.length - 1));
    };
  }, [location]);

  return (
    <Switch location={location}>
      <Route
        exact
        path="/backoffice/system/database"
        component={DatabaseListComponent}
      ></Route>
      <Route
        exact
        path="/backoffice/system/database/add"
        component={DatabaseAddComponent}
      ></Route>
    </Switch>
  );
}
