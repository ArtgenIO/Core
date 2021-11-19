import { FastifyInstance } from 'fastify';

export interface IHttpGateway {
  register(httpServer: FastifyInstance): Promise<void>;
  deregister?(): Promise<void>;
}
