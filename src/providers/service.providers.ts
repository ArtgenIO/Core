import { DatabaseObserver } from '../observers/database.observer';
import { AuthenticationService } from '../services/authentication.service';
import { BlueprintService } from '../services/blueprint.service';
import { CrudService } from '../services/crud.service';
import { DatabaseConnectionService } from '../services/database-connection.service';
import { DatabaseService } from '../services/database.service';
import { FlowEventService } from '../services/flow-event.service';
import { FlowSchedulerService } from '../services/flow-scheduler.service';
import { FlowService } from '../services/flow.service';
import { HttpService } from '../services/http.service';
import { KeyValueService } from '../services/key-value.service';
import { LambdaService } from '../services/lambda.service';
import { ODataService } from '../services/odata.service';
import { OpenApiService } from '../services/openapi.service';
import { PageService } from '../services/page.service';
import { SchemaService } from '../services/schema.service';
import { SearchService } from '../services/search.service';
import { TelemetryService } from '../services/telemetry.service';

export const ServiceProviders = [
  AuthenticationService,
  BlueprintService,
  CrudService,
  DatabaseConnectionService,
  DatabaseObserver,
  DatabaseService,
  FlowEventService,
  FlowSchedulerService,
  FlowService,
  HttpService,
  KeyValueService,
  LambdaService,
  ODataService,
  OpenApiService,
  PageService,
  SchemaService,
  SearchService,
  TelemetryService,
];
