import { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router';
import { ADMIN_URL } from '../../admin/admin.constants';
import DatabaseAddComponent from './connect.component';
import DatabaseListComponent from './list.component';

export default function DatabaseIndexComponent() {
  const location = useLocation();
  const base = `${ADMIN_URL}/database`;

  return (
    <Switch location={location}>
      <Route exact path={base} component={DatabaseListComponent}></Route>
      <Route
        exact
        path={`${base}/connect`}
        component={DatabaseAddComponent}
      ></Route>
      <Route
        path={`${base}/artboard/:database`}
        component={lazy(() => import('./artboard/artboard.component'))}
      />
    </Switch>
  );
}
