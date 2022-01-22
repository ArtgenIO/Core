import React from 'react';
import { Route, Routes } from 'react-router';
import CreateExtension from './create.component';
import EditExtension from './edit.component';
import ImportExtension from './import.component';
import ExtensionStoreList from './list.component';

export default function CloudAppsRouter() {
  return (
    <Routes>
      <Route path={''} element={<ExtensionStoreList />} />
      <Route path={`create`} element={<CreateExtension />} />
      <Route path={`import`} element={<ImportExtension />} />
      <Route path={`:id/install`} element={<ImportExtension />} />
      <Route path={`:id`} element={<EditExtension />} />
    </Routes>
  );
}
