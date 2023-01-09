import { Navigate, Route, Routes } from 'react-router-dom';
import SignInComponent from './sign-in.component';
import SignUpComponent from './sign-up.component';
import './_router.component.less';

export default function AuthenticationRouterComponent() {
  return (
    <section className="auth-layout test--auth-cover">
      <Routes>
        <Route path="/sign-in" element={<SignInComponent />} />
        <Route path="/sign-up" element={<SignUpComponent />} />
        <Route path="*" element={<Navigate to="/sign-in" />} />
      </Routes>
    </section>
  );
}
