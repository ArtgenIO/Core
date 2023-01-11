import { Navigate, Route, Routes } from 'react-router';
import FlowBoardWrapperComponent from './flowboard/_wrapper.component';
import ImportFlowComponent from './importer.component';
import FlowListComponent from './list.component';

export default function FlowRouterComponent() {
  return (
    <Routes>
      <Route
        path="artboard/:id"
        element={<FlowBoardWrapperComponent />}
      ></Route>
      <Route path="list" element={<FlowListComponent />}></Route>
      <Route path="import" element={<ImportFlowComponent />}></Route>
      <Route path="/" element={<Navigate to="/flow/list" />}></Route>
    </Routes>
  );
}
