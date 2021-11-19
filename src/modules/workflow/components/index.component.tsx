import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import WorkflowListComponent from './list.component';

export default function WorkflowPageComponent() {
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route
        exact
        path="/admin/workflow"
        component={WorkflowListComponent}
      ></Route>
      <Route
        path="/admin/workflow/create"
        component={lazy(() => import('./create.component'))}
      ></Route>
      <Route
        path="/admin/workflow/artboard/:id"
        component={lazy(() => import('./artboard.component'))}
      ></Route>
    </Switch>
  );
}
