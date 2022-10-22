import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import ImportFlowComponent from './importer.component';
import FlowListComponent from './list.component';

export default function FlowRouterComponent() {
  const FlowWrapper = lazy(() => import('./flowboard/_wrapper.component'));

  return (
    <Routes>
      <Route path="artboard/:id" element={<FlowWrapper />}></Route>
      <Route path="list" element={<FlowListComponent />}></Route>
      <Route path="import" element={<ImportFlowComponent />}></Route>
      <Route path="/" element={<Navigate to="/flow/list" />}></Route>
    </Routes>
  );
}
