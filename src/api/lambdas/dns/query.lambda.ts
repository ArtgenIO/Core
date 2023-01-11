import { Service } from '@hisorange/kernel';
import { Resolver } from 'dns/promises';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { ILambda } from '../../types/lambda.interface';

type Config = {
  servers: string[];
  type: 'A' | 'TXT' | 'MX' | 'NS';
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'dns.query',
  description: 'Resolve a DNS address',
  handles: [
    new LambdaInputHandleDTO('host', {
      title: 'Host',
      type: 'string',
      examples: ['artgen.io'],
    }),
    new LambdaOutputHandleDTO('addresses', {
      type: 'array',
      title: 'IP Addresses',
      items: {
        title: 'IP Address',
        type: 'string',
      },
    }),
    new LambdaOutputHandleDTO('error', {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        code: {},
      },
      required: ['message', 'code'],
    }),
  ],
  config: {
    type: 'object',
    properties: {
      servers: {
        title: 'Server',
        type: 'array',
        items: {
          title: 'Server Address',
          type: 'string',
        },
        default: ['8.8.8.8', '1.1.1.1'],
      },
      type: {
        title: 'Record Type',
        enum: ['A', 'TXT', 'MX', 'NS'],
        default: 'A',
      },
    },
    required: ['servers'],
  },
})
export class DNSQueryLambda implements ILambda {
  async invoke(ctx: FlowSession) {
    const host = ctx.getInput('host') as string;
    const config = ctx.getConfig<Config>();

    try {
      const resolver = new Resolver();
      resolver.setServers(config.servers);

      return {
        addresses: await resolver.resolve(host, config.type),
      };
    } catch (error) {
      return {
        error: {
          message: (error as Error).message,
          code: (error as { code: number }).code,
        },
      };
    }
  }
}
