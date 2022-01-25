import { Model } from 'objection';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { SchemaService } from '../../schema/service/schema.service';
import { IPage } from '../interface/page.interface';

type PageModel = IPage & Model;

@Service()
export class PageService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async loadRoutes(): Promise<IPage[]> {
    const model = this.schema.getSysModel<PageModel>(SchemaRef.PAGE);
    const pages = await model
      .query()
      .select(['id', 'title', 'path', '__artgen_tags']);

    return pages.map(p => p.$toJson());
  }

  async getHtml(id: string): Promise<string> {
    const model = this.schema.getSysModel<PageModel>(SchemaRef.PAGE);
    const page: IPage = (await model.query().findById(id)).$toJson();
    const html = `<html>
      <head>
        <title>${page.title}</title>
        <style>${page.content['gjs-css']}</style>
      </head>
      <body>${page.content['gjs-html']}</body>
    </html>`;

    return html;
  }
}
