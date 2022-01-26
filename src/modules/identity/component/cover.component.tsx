import axios from 'axios';
import { useEffect, useState } from 'react';
import './cover.component.less';
import GalaxyComponent from './galaxy.component';
import SignInComponent from './sign-in.component';
import SignUpComponent from './sign-up.component';

type IDentityStatusResponse = {
  canSignUp: boolean;
};

export default function AuthLayoutComponent() {
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    axios.get<IDentityStatusResponse>('/api/identity/status').then(reply => {
      setShowSignUp(reply.data.canSignUp);
    });
  }, []);

  return (
    <section className="auth-layout">
      <div className="left-panel">
        <GalaxyComponent />
        <div className="cover" />
        <div className="moto">
          <h1>Hello, Artisan!</h1>
          <p>Opportunities don't happen. You create them.</p>
        </div>
        <div className="subtext">
          Having trouble? Click&nbsp;
          <a href="https://docs.artgen.io" target="_blank" title="Troubleshoot">
            here
          </a>
          &nbsp;for help.
        </div>
      </div>
      <div className="right-panel">
        <div className="mobile-panel">
          <div className="cover" />
        </div>
        <div className="content">
          {showSignUp ? (
            <SignUpComponent setShowSignUp={setShowSignUp} />
          ) : (
            <SignInComponent setShowSignUp={setShowSignUp} />
          )}
        </div>
      </div>
    </section>
  );
}
