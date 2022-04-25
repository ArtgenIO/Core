import { useState } from 'react';
import './cover.component.less';
import SignInComponent from './sign-in.component';
import SignUpComponent from './sign-up.component';

export default function AuthLayoutComponent() {
  const [showSignUp, setShowSignUp] = useState(true);

  return (
    <section className="auth-layout test--auth-cover">
      {showSignUp ? (
        <SignUpComponent setShowSignUp={setShowSignUp} />
      ) : (
        <SignInComponent setShowSignUp={setShowSignUp} />
      )}
    </section>
  );
}
