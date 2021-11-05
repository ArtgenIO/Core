import { readFile } from 'fs/promises';
import { join } from 'path';
import { ROOT_DIR } from '../../../paths';
import { Inject, Service } from '../../../system/container';
import { SchemaService } from '../../schema/service/schema.service';
import { IPage } from '../interface/page.interface';

@Service()
export class PageService {
  constructor(
    @Inject('classes.SchemaService')
    readonly schema: SchemaService,
  ) {}

  async loadRoutes(): Promise<IPage[]> {
    const repository = this.schema.getRepository('system', 'Page');
    const pages = repository.find({
      select: ['id', 'label', 'domain', 'path', 'tags'],
    });

    return pages;
  }

  async getHtml(id: string): Promise<string> {
    const repository = this.schema.getRepository('system', 'Page');
    const page: IPage = await repository.findOne(id);
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
    const repository = this.schema.getRepository('system', 'Page');

    // ALready exists
    if (await repository.findOne('1e1b9598-f8b8-4487-9b7b-166a363e8ce8')) {
      return;
    }

    const landing = await readFile(
      join(ROOT_DIR, 'storage/seed/page/landing.page.json'),
    );
    const record = repository.create(JSON.parse(landing.toString()));

    await repository.save(record);
  }
}
