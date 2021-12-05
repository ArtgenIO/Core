import './cover.component.less';
import GalaxyComponent from './galaxy.component';
import SignInComponent from './sign-in.component';

export default function AuthLayoutComponent() {
  return (
    <section className="auth-layout">
      <div className="left-panel">
        <GalaxyComponent />
        <div className="cover" />
        <div className="px-16 z-10 text-white">
          <h1 className="moto text-5xl">Hello, Artisan!</h1>
          <p className="text-2xl font-thin -mt-4 italic text-gray-400">
            Opportunities don't happen. You create them.
          </p>
        </div>
        <div className="subtext">
          Having trouble? Click&nbsp;
          <a
            href="https://github.com/ArtgenIO/Core/wiki"
            target="_blank"
            title="Troubleshoot"
            className="text-gray-400"
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
        <div className="w-full py-6 z-20">
          <SignInComponent />
        </div>
      </div>
    </section>
  );
}
