import './cover.component.css';
import GalaxyComponent from './galaxy.component';
import SignInComponent from './sign-in.component';

export default function AuthLayoutComponent() {
  return (
    <section className="min-h-screen flex items-stretch text-white auth-layout absolute top-0 left-0 right-0 bottom-0 z-50">
      <div className="left-panel hero-bg">
        <GalaxyComponent />
        <div className="cover" />
        <div className="w-full px-24 z-10 text-white">
          <h1 className="text-5xl moto font-thin text-left tracking-wide">
            Welcome back!
          </h1>
          <p className="text-2xl font-thin my-4 italic text-gray-400">
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
        <div className="mobile-panel hero-bg">
          <div className="cover" />
        </div>
        <div className="w-full py-6 z-20">
          <SignInComponent />
        </div>
      </div>
    </section>
  );
}
