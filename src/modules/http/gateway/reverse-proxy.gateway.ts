import {
  IKernel,
  ILogger,
  Inject,
  Kernel,
  Logger,
  Service,
} from '@hisorange/kernel';
import fastProxy from 'fast-proxy';
import { FastifyInstance } from 'fastify';
import { Model } from 'objection';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { SchemaService } from '../../database/service/schema.service';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { IHttpGateway } from '../interface/http-gateway.interface';
import { IReverseProxy } from '../interface/reverse-proxy.interface';

type RPModel = IReverseProxy & Model;

@Service({
  tags: 'http:gateway',
})
export class ReverseProxyGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
    @Inject(Kernel)
    readonly kernel: IKernel,
  ) {}

  async register(upstream: FastifyInstance): Promise<void> {
    const model = this.schema.getSysModel<RPModel>(SchemaRef.REV_PROXY);
    const destinations = await model.query();

    for (const r of destinations) {
      try {
        let target = r.target;

        if (!target.match(/^http/)) {
          target = `http://${target}`;
        }

        const { proxy, close } = fastProxy({
          base: target,
          undici: {
            connections: 100,
            keepAliveTimeout: 5,
            pipelining: 10,
          },
          keepAliveMsecs: 5,
          maxSockets: 512,
          rejectUnauthorized: false,
        });

        const constraints: { host?: string } = {};

        if (r.host && r.host !== '*') {
          constraints.host = r.host;
        }

        upstream.all(
          r.path ?? '/',
          {
            constraints,
          },
          (req, res) => {
            if (req.headers['x-forwarded-by'] == 'artgen') {
              this.logger.warn('Request loop detected!');

              res.send(
                JSON.stringify({
                  error: 402,
                  message: 'Bad Gateway',
                }),
              );

              return;
            }

            const queryString = req.query
              ? '?' +
                decodeURIComponent(stringify(req.query as ParsedUrlQueryInput))
              : '';

            const path = r.stripPath
              ? req.url.substring(0, r.path.length)
              : req.url;
            const url = `${path}${queryString}`;

            this.logger.debug(
              'Forwarding [%s][%s] -> [%s]',
              req.id.substr(0, 8),
              url,
              target,
            );

            proxy(req.raw, res.raw, url, {
              queryString: req.query as string,
              rewriteRequestHeaders: (req, headers) => {
                headers['x-forwarded-by'] = 'artgen';

                if (r.hostRewrite && r.hostRewrite != '0') {
                  headers['host'] = r.hostRewrite;
                }

                delete headers['connection'];

                return headers;
              },
            });
          },
        );

        this.logger.info(
          'Reverse Proxy registered [%s][%s] -> [%s]',
          r.host ?? '*',
          r.path,
          r.target,
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }
}
