import { MehOutlined, UnlockOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Layout,
  notification,
  Row,
} from 'antd';
import { Content } from 'antd/es/layout/layout';
import Col from 'antd/lib/grid/col';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { jwtAtom } from '../../atoms/admin.atoms';

type Credentials = {
  email: string;
  password: string;
};

type Response = {
  accessToken: string;
};

export default function SignInComponent() {
  const setJwt = useSetRecoilState(jwtAtom);
  const navigateTo = useNavigate();

  const doSignIn = (values: Credentials) => {
    axios
      .post<Response>('/api/authentication/jwt/sign-in', values)
      .then(response => {
        notification.success({
          key: 'authentication',
          icon: <UnlockOutlined className="text-green-400" />,
          message: 'Authentication Successful!',
          description: 'Welcome, Artisan!, have a wondeful day <3',
          placement: 'bottomRight',
        });

        setJwt(response.data.accessToken);
      })
      .catch(() => {
        notification.error({
          key: 'authentication',
          icon: <MehOutlined className="text-red-400" />,
          message: 'Authentication Failed!',
          description: 'Please check your credentials',
          placement: 'bottomRight',
        });
      });
  };

  return (
    <Layout>
      <Content className="flex h-screen w-full items-center">
        <Card
          className="w-1/3 mx-auto"
          title={
            <span className="block text-center font-header text-2xl">
              Artgen <span className="text-success-400">// Sign In</span>
            </span>
          }
          size="small"
        >
          <Row gutter={24}>
            <Col span={12}>
              <div
                style={{
                  backgroundImage: 'url(assets/images/flow.png)',
                }}
                className="bg-no-repeat bg-cover bg-center rounded-md h-full"
              ></div>
            </Col>
            <Col span={12}>
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
                    {
                      required: true,
                      message: 'Please, input your email address!',
                    },
                  ]}
                >
                  <Input
                    className="test--email-address"
                    placeholder="example@artgen.io"
                    type="email"
                    autoFocus
                  />
                </Form.Item>

                <Form.Item
                  label="Password:"
                  name="password"
                  rules={[
                    { required: true, message: 'Please, input your password!' },
                  ]}
                >
                  <Input.Password
                    className="test--password"
                    placeholder="********"
                  />
                </Form.Item>

                <Divider />

                <Form.Item>
                  <Button
                    className="test--sign-in-btn info"
                    htmlType="submit"
                    size="middle"
                    block
                    type="primary"
                    icon={<UnlockOutlined />}
                  >
                    Sign In!
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
}
