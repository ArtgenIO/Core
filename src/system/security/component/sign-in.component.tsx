import { Link } from 'react-router-dom';
import AuthLayoutComponent from './auth-layout.component';
import './auth-pages.less';

export default function SignInComponent() {
  return (
    <AuthLayoutComponent
      callout="Welcome back!"
      moto="Opportunities don't happen. You create them."
    >
      <h1 className="my-6 w-100 content-center" id="js-hexa">
        <div className="hexa"></div>
      </h1>
      <h1
        className="my-6 w-100 content-center text-5xl"
        style={{ fontWeight: 100 }}
        id="js-logo"
      >
        Artgen
      </h1>
      <div className="py-6 space-x-2">
        <span className="social-icon">f</span>
        <span className="social-icon">G+</span>
        <span className="social-icon">in</span>
      </div>
      <p className="misc-text">or use your email account</p>
      <form method="post" className="sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
        <div className="pb-2 pt-4">
          <input placeholder="Your Email Address" type="email" required />
        </div>
        <div className="pb-2 pt-4">
          <input type="password" placeholder="************" required />
        </div>
        <div className="misc-text text-right">
          <Link to="/backoffice/auth/signup">Forgot your password?</Link>
        </div>
        <div className="px-1 pb-2 pt-4">
          <button type="submit" className="ag-transition">
            Sign In
          </button>
        </div>
      </form>
    </AuthLayoutComponent>
  );
}
