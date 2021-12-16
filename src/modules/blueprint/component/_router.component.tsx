import { Route, Routes } from 'react-router';
import ExtensionPanelWrapper from './panel/_wrapper.component';
import ExtensionStoreRouter from './store/_router.component';

export default function ExtensionsRouter() {
  const base = '/admin/ext';

  return (
    <Routes>
      <Route path={`${base}/store`} element={<ExtensionStoreRouter />}></Route>
      <Route path={`${base}/:id`} element={<ExtensionPanelWrapper />} />
    </Routes>
  );
}
