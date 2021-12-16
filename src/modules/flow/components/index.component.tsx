import React, { lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import WorkflowListComponent from './list.component';

export default function WorkflowPageComponent() {
  const location = useLocation();

  const Create = lazy(() => import('./create.component'));
  const Artboard = lazy(() => import('./artboard.component'));

  return (
    <Routes location={location}>
      <Route path="/admin/workflow" element={<WorkflowListComponent />}></Route>
      <Route path="/admin/workflow/create" element={<Create />}></Route>
      <Route path="/admin/workflow/artboard/:id" element={<Artboard />}></Route>
    </Routes>
  );
}
