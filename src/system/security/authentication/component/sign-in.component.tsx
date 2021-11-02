import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { jwtAtom } from '../../../../management/backoffice/backoffice.atoms';

type FormValues = {
  email: string;
  password: string;
};

export default function SignInComponent() {
  const setJwt = useSetRecoilState(jwtAtom);

  const doSignIn = (values: FormValues) => {
    axios
      .post('/api/$auth/signin', values)
      .then(response => {
        message.success('Welcome back!');
        setJwt(response.data);
      })
      .catch(error => {
        console.error(error);
        message.error('Sign In failed!');
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
          <Button type="primary" htmlType="submit" block>
            Sign In
          </Button>
        </Form.Item>

        <div className="mb-5 text-right mr-10">
          Don't have an account?{' '}
          <Link to={'/backoffice/auth/signup'}>Sign Up</Link> now!
        </div>
      </Form>
    </>
  );
}
