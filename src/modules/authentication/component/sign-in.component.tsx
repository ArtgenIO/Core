import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
  LinkedinOutlined,
  MehOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, notification } from 'antd';
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { jwtAtom } from '../../admin/admin.atoms';

type FormValues = {
  email: string;
  password: string;
};

export default function SignInComponent() {
  const setJwt = useSetRecoilState(jwtAtom);

  const doSignIn = (values: FormValues) => {
    axios
      .post<{ accessToken: string }>('/api/authentication/jwt/sign-in', values)
      .then(response => {
        notification.success({
          icon: <UnlockOutlined className="text-green-400" />,
          message: 'Authentication Successful!',
          description: 'Welcome, Artisan!, have a wondeful day <3',
        });

        setJwt(response.data.accessToken);
      })
      .catch(error => {
        notification.error({
          icon: <MehOutlined className="text-red-400" />,
          message: 'Authentication Failed!',
          description: 'Please check your credentials',
        });
      });
  };

  return (
    <>
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
      <div className="py-6 space-x-2 social">
        <FacebookOutlined />
        <GoogleOutlined />
        <LinkedinOutlined />
        <GithubOutlined />
      </div>
      <p className="misc-text">or use your email account</p>
      <Form
        name="sign-in"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ email: 'demo@artgen.io', password: 'demo' }}
        autoComplete="on"
        onFinish={doSignIn.bind(doSignIn)}
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button
            className="js--sign-in"
            type="primary"
            htmlType="submit"
            block
          >
            Sign In
          </Button>
        </Form.Item>

        <div className="mb-5 text-right mr-10">
          Don't have an account? <Link to={'/admin/auth/signup'}>Sign Up</Link>{' '}
          now!
        </div>
      </Form>
    </>
  );
}
