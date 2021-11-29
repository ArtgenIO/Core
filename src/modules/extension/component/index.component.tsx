import React from 'react';
import { Route, Switch, useLocation } from 'react-router';
import CreateExtensionComponent from './create.component';
import EditExtensionComponent from './edit.component';
import ImportExtensionComponent from './import.component';
import ListExtensionComponent from './list.component';

export default function ExtensionsIndexComponent() {
  const location = useLocation();
  const baseURL = '/admin/extension';

  return (
    <Switch location={location}>
      <Route exact path={baseURL} component={ListExtensionComponent}></Route>
      <Route
        exact
        path={`${baseURL}/create`}
        component={CreateExtensionComponent}
      ></Route>
      <Route
        exact
        path={`${baseURL}/import`}
        component={ImportExtensionComponent}
      ></Route>
      <Route path={`${baseURL}/:id`} component={EditExtensionComponent} />
    </Switch>
  );
}
