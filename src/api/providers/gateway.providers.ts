import { IdentityGateway } from '../controllers/authentication.gateway';
import { FlowHttpGateway } from '../controllers/flow.gateway';
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
  FlowHttpGateway,
];
