import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import WorkflowListComponent from './list.component';

export default function WorkflowPageComponent() {
  const Create = lazy(() => import('./create.component'));
  const Artboard = lazy(() => import('./artboard.component'));

  return (
    <Routes>
      <Route path="" element={<WorkflowListComponent />}></Route>
      <Route path="create" element={<Create />}></Route>
      <Route path="artboard/:id" element={<Artboard />}></Route>
    </Routes>
  );
}
