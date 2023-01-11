import { IContext, Service } from '@hisorange/kernel';
import { inject } from '@loopback/context';
import MeiliSearch from 'meilisearch';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { ILambda } from '../../types/lambda.interface';
import { RowLike } from '../../types/row-like.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'content.meili.index',

  description: 'Index the given documents',
  handles: [
    new LambdaInputHandleDTO('input', {
      type: 'object',
      properties: {
        index: {
          title: 'Index',
          type: 'string',
        },
        documents: {
          title: 'Documents',
          type: 'array',
          items: {
            type: 'object',
          },
        },
      },
    }),
    new LambdaOutputHandleDTO('result', {}),
    new LambdaOutputHandleDTO('error', {}),
  ],
})
export class ContentMeiliIndexLambda implements ILambda {
  protected client: MeiliSearch;

  constructor(
    @inject.context()
    readonly ctx: IContext,
  ) {
    if (process.env.ARTGEN_MEILI_HOST) {
      this.client = new MeiliSearch({
        host: process.env.ARTGEN_MEILI_HOST,
        apiKey: process.env.ARTGEN_MEILI_KEY ?? undefined,
      });
    }
  }

  async invoke(session: FlowSession) {
    const input = session.getInput<{
      index: string;
      documents: RowLike[];
    }>('input');

    if (!this.client) {
      return {
        error: {
          message: 'Meili search is not connected',
        },
      };
    }

    try {
      return {
        result: await this.client
          .index(input.index)
          .addDocuments(input.documents),
      };
    } catch (error) {
      return { error };
    }
  }
}
