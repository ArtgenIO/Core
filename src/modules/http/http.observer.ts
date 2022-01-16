import { debounce, DebouncedFunc } from 'lodash';
import isEqual from 'lodash.isequal';
import { Inject } from '../../app/container';
import { toStructure } from '../database/library/structure/to-structure';
import { Observer, On } from '../event';
import { ISchema } from '../schema';
import { HttpService } from './service/http.service';

@Observer()
export class HttpObserver {
  protected __update: DebouncedFunc<() => Promise<void>>;

  constructor(
    @Inject(HttpService)
    readonly service: HttpService,
  ) {
    this.__update = debounce(() => this.service.updateUpstream(), 500);
  }

  @On('crud.main.Schema.created')
  async onSchemaCread() {
    this.service.updateUpstream();
  }

  @On('crud.main.Schema.deleted')
  async onSchemaDelete() {
    this.service.updateUpstream();
  }

  @On('crud.main.Schema.updated')
  async onSchemaUpdated(newValue: ISchema, oldValue: ISchema) {
    const newStruct = toStructure(newValue);
    const oldStruct = toStructure(oldValue);

    if (!isEqual(newStruct, oldStruct)) {
      this.__update();
    }
  }

  @On('crud.main.Page.*', {
    debounce: 500,
  })
  async onPageChange() {
    this.service.updateUpstream();
  }

  @On('crud.main.Flow.*', {
    debounce: 500,
  })
  async onFlowChange() {
    this.service.updateUpstream();
  }
}
