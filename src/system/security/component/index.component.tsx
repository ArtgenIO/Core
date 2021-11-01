import React from 'react';
import { Route, Switch, useLocation } from 'react-router';
import SignInComponent from './sign-in.component';
import SignUpComponent from './sign-up.component';

export default function AuthIndexComponent() {
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route path="/backoffice/auth/signin" component={SignInComponent} />
      <Route path="/backoffice/auth/signup" component={SignUpComponent} />
    </Switch>
  );
}
