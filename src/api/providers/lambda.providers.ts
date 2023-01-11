import { CronTriggerLambda } from '../lambdas/cron.trigger';
import { DnsQueryLambda } from '../lambdas/dns-query.lambda';
import { EmitEventLambda } from '../lambdas/emit.lambda';
import { EventTrigger } from '../lambdas/event.trigger';
import { HashCompareLambda } from '../lambdas/hash-compare.lambda';
import { HashCreateLambda } from '../lambdas/hash-create.lambda';
import { HttpRequestLambda } from '../lambdas/http-request.lambda';
import { HttpTerminateLambda } from '../lambdas/http-terminate.lambda';
import { HttpTriggerLambda } from '../lambdas/http-trigger.lambda';
import { CompareLambda } from '../lambdas/if.lambda';
import { ContentMeiliIndexLambda } from '../lambdas/index.lambda';
import { LengthLambda } from '../lambdas/length.lambda';
import { LogLambda } from '../lambdas/log.lambda';
import { ReadLambdaLambda } from '../lambdas/read-lambda.lambda';
import { RestCreateLambda } from '../lambdas/rest-create.lambda';
import { RestFindLambda } from '../lambdas/rest-find.lambda';
import { TokenSignLambda } from '../lambdas/token-sign.lambda';

export const LambdaProviders = [
  LogLambda,
  RestCreateLambda,
  TokenSignLambda,
  RestFindLambda,
  HashCompareLambda,
  HashCreateLambda,
  HttpTriggerLambda,
  HttpRequestLambda,
  HttpTerminateLambda,
  DnsQueryLambda,
  CronTriggerLambda,
  EmitEventLambda,
  ReadLambdaLambda,
  LengthLambda,
  CompareLambda,
  ContentMeiliIndexLambda,
  EventTrigger,
];
