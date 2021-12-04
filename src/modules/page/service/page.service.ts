import { readFile } from 'fs/promises';
import { Model } from 'objection';
import { join } from 'path';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { SEED_DIR } from '../../../app/globals';
import { SchemaService } from '../../schema/service/schema.service';
import { IPage } from '../interface/page.interface';

type PageModel = IPage & Model;

@Service()
export class PageService {
  protected isSeeded: boolean = false;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async loadRoutes(): Promise<IPage[]> {
    if (!this.isSeeded) {
      await this.seed();

      this.isSeeded = true;
    }

    const model = this.schema.getModel<PageModel>('system', 'Page');
    const pages = await model
      .query()
      .select(['id', 'label', 'domain', 'path', '__artgen_tags']);

    return pages.map(p => p.$toJson());
  }

  async getHtml(id: string): Promise<string> {
    const model = this.schema.getModel<PageModel>('system', 'Page');
    const page: IPage = (await model.query().findById(id)).$toJson();
    const html = `<html>
      <head>
        <title>${page.label}</title>
        <style>${page.content['gjs-css']}</style>
      </head>
      <body>${page.content['gjs-html']}</body>
    </html>`;

    return html;
  }

  async seed() {
    const model = this.schema.getModel('system', 'Page');

    // ALready exists
    if (await model.query().findById('1e1b9598-f8b8-4487-9b7b-166a363e8ce8')) {
      return;
    }

    const landing = await readFile(join(SEED_DIR, 'landing.page.json'));

    await model.query().insert(JSON.parse(landing.toString()));
    this.logger.info('Pages seeded');
  }
}
