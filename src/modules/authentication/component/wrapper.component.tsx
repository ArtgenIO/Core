import { FieldTimeOutlined, LockOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom } from '../../admin/admin.atoms';
import { getTokenExpiration } from '../util/get-token-expiration';
import AuthenticationCoverComponent from './cover.component';

export default function AuthenticationWrapperComponent({
  children,
}: PropsWithChildren<{}>) {
  // State
  const token = useRecoilValue(jwtAtom);
  const resetToken = useResetRecoilState(jwtAtom);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [resetTimeout, setResetTimeout] = useState(null);
  const [warningTimeout, setWarningTimeout] = useState(null);

  useEffect(() => {
    if (resetTimeout) {
      clearTimeout(resetTimeout);
      setResetTimeout(null);
    }

    if (warningTimeout) {
      clearTimeout(warningTimeout);
      setWarningTimeout(null);
    }

    if (token) {
      const expires = getTokenExpiration(token);

      if (expires > 0) {
        setIsAuthenticated(true);

        if (expires > 5000) {
          setWarningTimeout(
            setTimeout(() => {
              notification.warn({
                message: 'Authentication Expires Soon!',
                icon: <FieldTimeOutlined className="text-yellow-500" />,
                description:
                  'Your authentication token will expire in 5 seconds, the browser will display the sign in form...',
              });
            }, expires - 5000),
          );
        }

        // Reset the token and refresh the rendering engine when the token expires.
        setResetTimeout(setTimeout(resetToken, expires));

        return;
      }
    } else {
      notification.warn({
        message: 'Authentication is Required!',
        icon: <LockOutlined className="text-red-400" />,
        description:
          'Please verify Your identity, to access the requested page.',
      });
    }

    // Reset token on invalid branches.
    resetToken();

    // Render the authentication cover.
    setIsAuthenticated(false);
  }, [token]);

  return <>{isAuthenticated ? children : <AuthenticationCoverComponent />}</>;
}
