import { PropsWithChildren } from 'react';
import './auth-layout.less';

interface Prop {
  callout: string;
  moto: string;
}

export default function AuthLayoutComponent({
  callout,
  moto,
  children,
}: PropsWithChildren<Prop>) {
  return (
    <section className="min-h-screen flex items-stretch text-white auth-layout absolute top-0 left-0 right-0 bottom-0 z-50">
      <div className="left-panel hero-bg">
        <div className="cover" />
        <div className="w-full px-24 z-10">
          <h1 className="text-5xl font-thin text-left tracking-wide">
            {callout}
          </h1>
          <p className="text-3xl font-thin my-4 italic text-gray-400">{moto}</p>
        </div>
        <div className="subtext">Having trouble? Click here for help.</div>
      </div>
      <div className="right-panel">
        <div className="mobile-panel hero-bg">
          <div className="cover" />
        </div>
        <div className="w-full py-6 z-20">{children}</div>
      </div>
    </section>
  );
}
