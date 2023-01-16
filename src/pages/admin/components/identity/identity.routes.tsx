import { Navigate, Route, Routes } from 'react-router-dom';
import SignInComponent from './sign-in.component';

export default function AuthenticationRouterComponent() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInComponent />} />
      <Route path="*" element={<Navigate to="/sign-in" />} />
    </Routes>
  );
}
