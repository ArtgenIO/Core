import { Route, Switch, useLocation } from 'react-router';
import AnalyticsEditorComponent from './editor.component';
import AnalyticsListComponent from './list.component';

export default function AnalyticsIndexComponent() {
  const location = useLocation();
  const baseURL = '/admin/analytics';

  return (
    <Switch location={location}>
      <Route exact path={baseURL} component={AnalyticsListComponent}></Route>
      <Route
        exact
        path={`${baseURL}/:id/editor`}
        component={AnalyticsEditorComponent}
      ></Route>
    </Switch>
  );
}
