import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import FlowListComponent from './list.component';

export default function FlowRouterComponent() {
  const Flowboard = lazy(() => import('./flowboard.component'));

  return (
    <Routes>
      <Route path="artboard/:id" element={<Flowboard />}></Route>
      <Route path="list" element={<FlowListComponent />}></Route>
      <Route path="/" element={<Navigate to={`/admin/flow/list`} />}></Route>
    </Routes>
  );
}
