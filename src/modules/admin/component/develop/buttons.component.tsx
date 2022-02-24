import { Button, Col, Divider, Row, Switch } from 'antd';
import PageHeader from '../../layout/page-header.component';
import PageWithHeader from '../../layout/page-with-header.component';

export default function DevelopButtonsComponent() {
  return (
    <PageWithHeader header={<PageHeader title="Develop - Button Gallery" />}>
      <Divider />

      <Row gutter={16}>
        <Col span={4}>
          <Button block>Normal Button</Button>
        </Col>

        <Col span={4}>
          <Button type="primary" block>
            Primary Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="info" block>
            Info Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="success" block>
            Success Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="warning" block>
            Warning Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="error" block>
            Error Button
          </Button>
        </Col>
      </Row>

      <Row gutter={16} className="mt-4">
        <Col span={4}>
          <Button block ghost>
            Normal Ghost Button
          </Button>
        </Col>

        <Col span={4}>
          <Button type="primary" block ghost>
            Primary Ghost Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="info" block ghost>
            Info Ghost Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="success" block ghost>
            Success Ghost Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="warning" block ghost>
            Warning Ghost Button
          </Button>
        </Col>

        <Col span={4}>
          <Button className="error" block ghost>
            Error Ghost Button
          </Button>
        </Col>
      </Row>
      <Divider />

      <Row gutter={16} className="text-center">
        <Col span={4}>
          <Switch checked title="Normal Switch"></Switch>
          <Switch className="ml-2" title="Normal Switch"></Switch>
        </Col>

        <Col span={4}>
          <Switch checked className="primary" title="Primary Switch"></Switch>
          <Switch className="primary ml-2" title="Primary Switch"></Switch>
        </Col>

        <Col span={4}>
          <Switch checked className="info" title="Info Switch"></Switch>
          <Switch className="info ml-2" title="Info Switch"></Switch>
        </Col>

        <Col span={4}>
          <Switch checked className="success" title="Success Switch"></Switch>
          <Switch className="success ml-2" title="Success Switch"></Switch>
        </Col>

        <Col span={4}>
          <Switch checked className="warning" title="Warning Switch"></Switch>
          <Switch className="warning ml-2" title="Warning Switch"></Switch>
        </Col>

        <Col span={4}>
          <Switch checked className="error" title="Error Switch"></Switch>
          <Switch className="error ml-2" title="Error Switch"></Switch>
        </Col>
      </Row>
    </PageWithHeader>
  );
}
