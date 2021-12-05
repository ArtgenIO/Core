import { MehOutlined, UnlockOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  notification,
  Tooltip,
} from 'antd';
import axios from 'axios';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import { jwtAtom } from '../../admin/admin.atoms';

type Credentials = {
  email: string;
  password: string;
};

type Response = {
  accessToken: string;
};

export default function SignInComponent() {
  const setJwt = useSetRecoilState(jwtAtom);

  const doSignIn = (values: Credentials) => {
    axios
      .post<Response>('/api/authentication/jwt/sign-in', values)
      .then(response => {
        notification.success({
          icon: <UnlockOutlined className="text-green-400" />,
          message: 'Authentication Successful!',
          description: 'Welcome, Artisan!, have a wondeful day <3',
        });

        setJwt(response.data.accessToken);
      })
      .catch(() => {
        notification.error({
          icon: <MehOutlined className="text-red-400" />,
          message: 'Authentication Failed!',
          description: 'Please check your credentials',
        });
      });
  };

  return (
    <>
      <h1 className="w-full content-center">
        <div className="logo"></div>
      </h1>
      <h1 className="mb-4 w-full content-center text-5xl brand">Artgen Core</h1>

      <Alert
        type="info"
        className="text-left mb-4"
        message={
          <>
            Use <strong className="font-bold">demo@artgen.io</strong> with the
            password <strong className="font-bold">demo</strong>
          </>
        }
        showIcon
      />
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
            className="test--email-address bg-dark"
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
            className="test--password bg-dark"
            placeholder="********"
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button
            className="test--sign-in"
            type="primary"
            htmlType="submit"
            size="middle"
            block
            icon={<UnlockOutlined />}
          >
            Sign In!
          </Button>
        </Form.Item>

        <div className="mb-5 text-right">
          Don't have an account?&nbsp;
          <Tooltip title="Not yet implemented">
            <a className="line-through">Sign Up</a>
          </Tooltip>
          &nbsp;now!
        </div>
      </Form>
    </>
  );
}