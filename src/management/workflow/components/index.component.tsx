import React, { lazy, useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { breadcrumbsAtom } from '../../backoffice/backoffice.atoms';
import WorkflowListComponent from './list.component';

export default function WorkflowPageComponent() {
  const location = useLocation();
  const setBreadcrumb = useSetRecoilState(breadcrumbsAtom);

  useEffect(() => {
    setBreadcrumb(routes =>
      routes.concat({
        breadcrumbName: 'Workflows',
        path: 'management/workflow',
      }),
    );

    return () => setBreadcrumb(routes => routes.slice(0, routes.length - 1));
  }, []);

  return (
    <Switch location={location}>
      <Route
        exact
        path="/backoffice/management/workflow"
        component={WorkflowListComponent}
      ></Route>
      <Route
        path="/backoffice/management/workflow/drawboard/:id"
        component={lazy(() => import('./drawboard.component'))}
      ></Route>
    </Switch>
  );
}
