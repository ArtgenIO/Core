import { Route, Routes } from 'react-router-dom';
import LoadingComponent from '../loading/loading.component.jsx';
import DevelopButtonsComponent from './buttons.component';

export default function DevelopRouterComponent() {
  return (
    <Routes>
      <Route path="" element={<DevelopButtonsComponent />}></Route>
      <Route path="loading" element={<LoadingComponent />}></Route>
    </Routes>
  );
}
