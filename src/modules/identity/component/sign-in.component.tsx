import { MehOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, notification, Tooltip } from 'antd';
import axios from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { useSetRecoilState } from 'recoil';
import { jwtAtom } from '../../admin/admin.atoms';

type Credentials = {
  email: string;
  password: string;
};

type Response = {
  accessToken: string;
};

type Props = {
  setShowSignUp: Dispatch<SetStateAction<boolean>>;
  canSignUp: boolean;
};

export default function SignInComponent({ setShowSignUp, canSignUp }: Props) {
  const setJwt = useSetRecoilState(jwtAtom);

  const doSignIn = (values: Credentials) => {
    axios
      .post<Response>('/api/authentication/jwt/sign-in', values)
      .then(response => {
        notification.success({
          icon: <UnlockOutlined className="text-green-400" />,
          message: 'Authentication Successful!',
          description: 'Welcome, Artisan!, have a wondeful day <3',
          placement: 'bottomRight',
        });

        setJwt(response.data.accessToken);
      })
      .catch(() => {
        notification.error({
          icon: <MehOutlined className="text-red-400" />,
          message: 'Authentication Failed!',
          description: 'Please check your credentials',
          placement: 'bottomRight',
        });
      });
  };

  return (
    <>
      <h1 className="header">Artgen Core <span className='text-success-400'>// Beta</span></h1>
      <h1 className="w-full content-center">
        <div className="logo"></div>
      </h1>

      <Form
        name="sign-in"
        size="large"
        autoComplete="on"
        onFinish={doSignIn}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label="Email Address:"
          name="email"
          rules={[
            { required: true, message: 'Please input your email address!' },
          ]}
        >
          <Input
            className="test--email-address bg-midnight-800"
            placeholder="example@artgen.io"
            type="email"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          label="Password:"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            className="test--password bg-midnight-800"
            placeholder="********"
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button
            className="test--sign-in-btn"
            type="primary"
            htmlType="submit"
            size="middle"
            block
            icon={<UnlockOutlined />}
          >
            Sign In!
          </Button>
        </Form.Item>

        {canSignUp && (
          <div className="mb-5 text-right">
            Don't have an account?&nbsp;
            <Tooltip title="Not yet implemented">
              <a
                className="test--switch-sign-up"
                onClick={() => setShowSignUp(true)}
              >
                Sign Up
              </a>
            </Tooltip>
            &nbsp;now!
          </div>
        )}
      </Form>
    </>
  );
}
