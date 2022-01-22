import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import FlowListComponent from './list.component';

export default function FlowRouterComponent() {
  const Artboard = lazy(() => import('./artboard.component'));

  return (
    <Routes>
      <Route path="artboard/:id" element={<Artboard />}></Route>
      <Route path="list" element={<FlowListComponent />}></Route>
      <Route path="/" element={<Navigate to={`/admin/flow/list`} />}></Route>
    </Routes>
  );
}
