import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageIndexComponent from './_index.component';

export default function PageRouterComponent() {
  const Editor = lazy(() => import('./editor.component'));

  return (
    <Routes>
      <Route path="" element={<PageIndexComponent />}></Route>
      <Route path=":id" element={<Editor />}></Route>
    </Routes>
  );
}
