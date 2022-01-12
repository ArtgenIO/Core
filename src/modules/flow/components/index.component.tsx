import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import FlowListComponent from './list.component';

export default function FlowPageComponent() {
  const Create = lazy(() => import('./create.component'));
  const Artboard = lazy(() => import('./artboard.component'));

  return (
    <Routes>
      <Route path="" element={<FlowListComponent />}></Route>
      <Route path="artboard/:id" element={<Artboard />}></Route>
    </Routes>
  );
}
