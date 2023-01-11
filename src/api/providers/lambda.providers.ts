import { CronTriggerLambda } from '../lambdas/cron/trigger.lambda';
import { BCryptCompareLambda } from '../lambdas/crypt/bcrypt/compare.lambda';
import { BCryptHashLambda } from '../lambdas/crypt/bcrypt/hash.lambda';
import { JWTSignLambda } from '../lambdas/crypt/jwt/sign.lambda';
import { DNSQueryLambda } from '../lambdas/dns/query.lambda';
import { EmitEventLambda } from '../lambdas/event/emit.lambda';
import { OnEventTrigger } from '../lambdas/event/on.trigger';
import { HttpRequestLambda } from '../lambdas/http/request.lambda';
import { HttpTerminateLambda } from '../lambdas/http/terminate.lambda';
import { HttpTriggerLambda } from '../lambdas/http/trigger.lambda';
import { LogLambda } from '../lambdas/log.lambda';
import { LogicCompareLambda } from '../lambdas/logic/compare.lambda';
import { LogicLengthLambda } from '../lambdas/logic/length.lambda';
import { ContentMeiliIndexLambda } from '../lambdas/rest/index.lambda';
import { RestCreateLambda } from '../lambdas/rest/rest-create.lambda';
import { RestFindLambda } from '../lambdas/rest/rest-find.lambda';

export const LambdaProviders = [
  LogLambda,
  RestCreateLambda,
  JWTSignLambda,
  RestFindLambda,
  BCryptCompareLambda,
  BCryptHashLambda,
  HttpTriggerLambda,
  HttpRequestLambda,
  HttpTerminateLambda,
  DNSQueryLambda,
  CronTriggerLambda,
  EmitEventLambda,
  LogicLengthLambda,
  LogicCompareLambda,
  ContentMeiliIndexLambda,
  OnEventTrigger,
];
