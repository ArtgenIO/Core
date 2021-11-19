import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { jwtAtom } from '../../admin/admin.atoms';

export default function SignInComponent() {
  const [jwt, setJwt] = useRecoilState(jwtAtom);

  return (
    <>
      <h1 className="my-4 w-100 content-center" id="js-hexa">
        <div className="hexa"></div>
      </h1>
      <h1
        className="my-4 w-100 content-center text-5xl"
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
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[{ required: true, message: 'Please input your username!' }]}
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
          Don't have an account? <Link to={'/admin/auth/signup'}>Sign Up</Link>{' '}
          now!
        </div>
      </Form>
    </>
  );
}
