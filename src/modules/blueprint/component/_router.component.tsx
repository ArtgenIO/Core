import { Route, Routes } from 'react-router';
import ExtensionPanelWrapper from './panel/_wrapper.component';
import ExtensionStoreRouter from './store/_router.component';

export default function BlueprintRouter() {
  const base = '/admin/blueprint';

  return (
    <Routes>
      <Route path={`${base}/store`} element={<ExtensionStoreRouter />}></Route>
      <Route path={`${base}/:id`} element={<ExtensionPanelWrapper />} />
    </Routes>
  );
}
