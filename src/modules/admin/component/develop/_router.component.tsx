import { Route, Routes } from 'react-router-dom';
import DevelopButtonsComponent from './buttons.component';

export default function DevelopRouterComponent() {
  return (
    <Routes>
      <Route path="" element={<DevelopButtonsComponent />}></Route>
    </Routes>
  );
}
