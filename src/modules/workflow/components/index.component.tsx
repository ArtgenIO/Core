import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import WorkflowListComponent from './list.component';

export default function WorkflowPageComponent() {
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route
        exact
        path="/admin/management/workflow"
        component={WorkflowListComponent}
      ></Route>
      <Route
        path="/admin/management/workflow/create"
        component={lazy(() => import('./create.component'))}
      ></Route>
      <Route
        path="/admin/management/workflow/drawboard/:id"
        component={lazy(() => import('./drawboard.component'))}
      ></Route>
    </Switch>
  );
}
