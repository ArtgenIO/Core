import { debounce, DebouncedFunc } from 'lodash';
import isEqual from 'lodash.isequal';
import { Inject } from '../../app/container';
import { IKeyValueRecord } from '../content/interface/key-value.interface';
import { toStructure } from '../database/library/structure/to-structure';
import { Observer, On } from '../event';
import { ISchema } from '../schema';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { HttpService } from './service/http.service';

@Observer()
export class HttpObserver {
  protected __update: DebouncedFunc<() => Promise<void>>;

  constructor(
    @Inject(HttpService)
    readonly service: HttpService,
  ) {
    this.__update = debounce(() => this.service.updateUpstream(), 300);
  }

  @On(`crud.main.${SchemaRef.REV_PROXY}.*`)
  async onReverseProxyChange() {
    this.__update();
  }

  @On(`crud.main.${SchemaRef.SCHEMA}.created`)
  async onSchemaCread() {
    this.__update();
  }

  @On(`crud.main.${SchemaRef.KV}.*`)
  async onKeyValueChange(newValue: IKeyValueRecord) {
    if (newValue?.key.match(/^artgen\.http/)) {
      this.__update();
    }
  }

  @On(`crud.main.${SchemaRef.SCHEMA}.deleted`)
  async onSchemaDelete() {
    this.__update();
  }

  @On(`crud.main.${SchemaRef.SCHEMA}.updated`)
  async onSchemaUpdated(newSchema: ISchema, oldSchema: ISchema) {
    const newStruct = toStructure(newSchema);
    const oldStruct = toStructure(oldSchema);

    if (
      !isEqual(newStruct, oldStruct) ||
      !isEqual(newSchema.access, oldSchema.access)
    ) {
      this.__update();
    }
  }

  @On(`crud.main.${SchemaRef.PAGE}.*`)
  async onPageChange() {
    this.__update();
  }

  @On(`crud.main.${SchemaRef.FLOW}.*`)
  async onFlowChange() {
    this.__update();
  }
}
