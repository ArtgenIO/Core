import { MethodDecoratorFactory } from '@loopback/metadata';
import { HTTPMethods } from 'fastify';

export const ROUTE_META_KEY = 'artgen:ctrl.route';

export type IRouteMeta = {
  path?: string;
  method?: HTTPMethods;
  protected: boolean;
};

export function Get(meta?: IRouteMeta) {
  return MethodDecoratorFactory.createDecorator<IRouteMeta>(
    ROUTE_META_KEY,
    {
      path: '',
      method: 'GET',
      ...meta,
    },
    {
      decoratorName: '@Get',
    },
  );
}

export function Post(meta?: IRouteMeta) {
  return MethodDecoratorFactory.createDecorator<IRouteMeta>(
    ROUTE_META_KEY,
    {
      path: '',
      method: 'POST',
      ...meta,
    },
    {
      decoratorName: '@Post',
    },
  );
}

export function Patch(meta?: IRouteMeta) {
  return MethodDecoratorFactory.createDecorator<IRouteMeta>(
    ROUTE_META_KEY,
    {
      path: '',
      method: 'PATCH',
      ...meta,
    },
    {
      decoratorName: '@Patch',
    },
  );
}

export function Delete(meta?: IRouteMeta) {
  return MethodDecoratorFactory.createDecorator<IRouteMeta>(
    ROUTE_META_KEY,
    {
      path: '',
      method: 'DELETE',
      ...meta,
    },
    {
      decoratorName: '@Delete',
    },
  );
}
