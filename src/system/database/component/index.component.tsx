import { Route, Switch, useLocation } from 'react-router';
import DatabaseAddComponent from './add.component';
import DatabaseListComponent from './list.component';

export default function DatabaseIndexComponent() {
  const location = useLocation();

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
