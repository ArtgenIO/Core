import { ClassDecoratorFactory } from '@loopback/metadata';
import { ILambdaMeta } from '../interface/meta.interface';

export const LAMBDA_DECORATOR_META_KEY = 'artgen:lambda';

export const Lambda = (meta: ILambdaMeta) =>
  ClassDecoratorFactory.createDecorator(LAMBDA_DECORATOR_META_KEY, meta, {
    decoratorName: '@Lambda',
  });
