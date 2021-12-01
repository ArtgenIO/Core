import React from 'react';
import { Route, Switch, useLocation } from 'react-router';
import CreateExtension from './create.component';
import EditExtension from './edit.component';
import ImportExtension from './import.component';
import ExtensionStoreList from './list.component';

export default function ExtensionStoreRouter() {
  const location = useLocation();
  const base = '/admin/ext/store';

  return (
    <Switch location={location}>
      <Route exact path={base} component={ExtensionStoreList}></Route>
      <Route exact path={`${base}/create`} component={CreateExtension}></Route>
      <Route exact path={`${base}/import`} component={ImportExtension}></Route>
      <Route path={`${base}/:id/install`} component={ImportExtension}></Route>
      <Route exact path={`${base}/:id`} component={EditExtension} />
    </Switch>
  );
}
