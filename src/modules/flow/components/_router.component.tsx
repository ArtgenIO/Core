import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import FlowListComponent from './list.component';

export default function FlowRouterComponent() {
  const FlowWrapper = lazy(() => import('./flowboard/_wrapper.component'));

  return (
    <Routes>
      <Route path="artboard/:id" element={<FlowWrapper />}></Route>
      <Route path="list" element={<FlowListComponent />}></Route>
      <Route path="/" element={<Navigate to={`/admin/flow/list`} />}></Route>
    </Routes>
  );
}
