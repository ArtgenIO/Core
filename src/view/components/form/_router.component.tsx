import { Navigate, Route, Routes } from 'react-router';
import FormListComponent from './list.component';

export default function FormRouterComponent() {
  return (
    <Routes>
      <Route path="list" element={<FormListComponent />}></Route>
      <Route path="/" element={<Navigate to={`/form/list`} />}></Route>
    </Routes>
  );
}
