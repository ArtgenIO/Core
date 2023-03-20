import { FlowGateway } from '../controllers/flow.gateway';
import { IdentityGateway } from '../controllers/identity.gateway';
import { LambdaController } from '../controllers/lambda.controller';
import { PageGateway } from '../controllers/page.gateway';
import { RestGateway } from '../controllers/rest.gateway';
import { ReverseProxyGateway } from '../controllers/reverse-proxy.gateway';
import { StaticGateway } from '../controllers/static.gateway';
import { TelemetryGateway } from '../controllers/telemetry.gateway';
import { TrapGateway } from '../controllers/trap.gateway';

export const GatewayProviders = [
  PageGateway,
  RestGateway,
  StaticGateway,
  TrapGateway,
  TelemetryGateway,
  IdentityGateway,
  ReverseProxyGateway,
  FlowGateway,

  LambdaController,
];
