import { Resolver } from 'dns/promises';
import { Service } from '../../../app/container';
import { WorkflowSession } from '../../flow/library/workflow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';

type Input = {
  domain: string;
};

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
    new InputHandleDTO('host', {
      title: 'Host',
      type: 'string',
      examples: ['artgen.io'],
    }),
    new OutputHandleDTO('addresses', {
      type: 'array',
      title: 'IP Addresses',
      items: {
        title: 'IP Address',
        type: 'string',
      },
    }),
    new OutputHandleDTO('error', {
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
export class DnsQueryLambda implements ILambda {
  async invoke(ctx: WorkflowSession) {
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
