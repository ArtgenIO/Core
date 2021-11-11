import { Route, Switch, useLocation } from 'react-router';
import SchemaBoardComponent from './schema-board/schema-board.component';

export default function SchemaIndexComponent() {
  const location = useLocation();

  return (
    <>
      <Switch location={location}>
        <Route
          exact
          path="/backoffice/content/schema/board/:database"
          component={SchemaBoardComponent}
        />
      </Switch>
    </>
  );
}
