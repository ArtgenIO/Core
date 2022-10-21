import { IContext, Service } from '@hisorange/kernel';
import { inject } from '@loopback/context';
import MeiliSearch from 'meilisearch';
import { RowLike } from '../../../../app/interface/row-like.interface';
import { FlowSession } from '../../../flow/library/flow.session';
import { Lambda } from '../../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../lambda/dto/output-handle.dto';
import { ILambda } from '../../../lambda/interface/lambda.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'content.meili.index',

  description: 'Index the given documents',
  handles: [
    new InputHandleDTO('input', {
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
    new OutputHandleDTO('result', {}),
    new OutputHandleDTO('error', {}),
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
