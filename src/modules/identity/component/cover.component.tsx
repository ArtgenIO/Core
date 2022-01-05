import './cover.component.less';
import GalaxyComponent from './galaxy.component';
import SignInComponent from './sign-in.component';

export default function AuthLayoutComponent() {
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
          <a
            href="https://github.com/ArtgenIO/Core/wiki"
            target="_blank"
            title="Troubleshoot"
          >
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
          <SignInComponent />
        </div>
      </div>
    </section>
  );
}
