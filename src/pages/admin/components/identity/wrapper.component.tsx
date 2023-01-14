import { FieldTimeOutlined, LockOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom } from '../../atoms/admin.atoms';
import { getTokenExpiration } from '../../library/get-token-expiration';
import AuthenticationRouterComponent from './_router.component';

export default function AuthenticationWrapperComponent({
  children,
}: PropsWithChildren<{}>) {
  // State
  const token = useRecoilValue(jwtAtom);
  const resetToken = useResetRecoilState(jwtAtom);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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

        if (expires > 30_000) {
          setWarningTimeout(
            setTimeout(() => {
              notification.warning({
                key: 'authentication',
                message: 'Authentication Expires Soon!',
                icon: <FieldTimeOutlined className="text-yellow-500" />,
                description:
                  'Your authentication token will expire in 30 seconds, the browser will display the sign in form...',
                placement: 'bottomLeft',
              });
            }, expires - 30_000),
          );
        }

        // Reset the token and refresh the rendering engine when the token expires.
        setResetTimeout(setTimeout(resetToken, expires));

        return;
      }
    } else {
      notification.warning({
        key: 'authentication',
        message: 'Authentication Required!',
        icon: <LockOutlined className="text-red-400" />,
        description:
          'Please verify Your identity, to access the requested page.',
        placement: 'bottomLeft',
      });
    }

    // Reset token on invalid branches.
    resetToken();

    // Render the authentication cover.
    setIsAuthenticated(false);
  }, [token]);

  if (isAuthenticated === null) {
    return <h1>Loading...</h1>;
  }

  return <>{isAuthenticated ? children : <AuthenticationRouterComponent />}</>;
}
