import React from 'react';
import { Route, Routes, useLocation } from 'react-router';
import CreateExtension from './create.component';
import EditExtension from './edit.component';
import ImportExtension from './import.component';
import ExtensionStoreList from './list.component';

export default function ExtensionStoreRouter() {
  const location = useLocation();
  const base = '/admin/ext/store';

  return (
    <Routes location={location}>
      <Route path={base} element={<ExtensionStoreList />} />
      <Route path={`${base}/create`} element={<CreateExtension />} />
      <Route path={`${base}/import`} element={<ImportExtension />} />
      <Route path={`${base}/:id/install`} element={<ImportExtension />} />
      <Route path={`${base}/:id`} element={<EditExtension />} />
    </Routes>
  );
}
