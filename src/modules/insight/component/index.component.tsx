import { Route, Routes, useLocation } from 'react-router';
import AnalyticsEditorComponent from './editor.component';
import AnalyticsListComponent from './list.component';

export default function AnalyticsIndexComponent() {
  const location = useLocation();
  const baseURL = '/admin/analytics';

  return (
    <Routes>
      <Route path={baseURL} element={<AnalyticsListComponent />}></Route>
      <Route
        path={`${baseURL}/:id/editor`}
        element={<AnalyticsEditorComponent />}
      ></Route>
    </Routes>
  );
}
