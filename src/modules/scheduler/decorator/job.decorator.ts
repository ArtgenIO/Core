import { MethodDecoratorFactory } from '@loopback/metadata';

export const JOB_META_KEY = 'artgen:job';
export type JobParams = {
  name?: string;
  timing: string;
};

export function Job(params: JobParams) {
  return MethodDecoratorFactory.createDecorator(JOB_META_KEY, params, {
    allowInheritance: true,
    decoratorName: '@Job',
  });
}
