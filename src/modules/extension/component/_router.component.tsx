import { Route, Switch, useLocation } from 'react-router';
import ExtensionPanelWrapper from './panel/_wrapper.component';
import ExtensionStoreRouter from './store/_router.component';

export default function ExtensionsRouter() {
  const location = useLocation();
  const base = '/admin/ext';

  return (
    <Switch location={location}>
      <Route path={`${base}/store`} component={ExtensionStoreRouter}></Route>
      <Route path={`${base}/:id`} component={ExtensionPanelWrapper} />
    </Switch>
  );
}
