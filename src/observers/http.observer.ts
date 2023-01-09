import { Inject, Observer, On } from '@hisorange/kernel';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import { toStructure } from '../library/to-structure';
import { ISchema } from '../models/schema.interface';
import { HttpService } from '../services/http.service';
import { IKeyValueRecord } from '../types/key-value.interface';
import { SchemaRef } from '../types/system-ref.enum';

@Observer()
export class HttpObserver {
  protected __update: () => Promise<void>;

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
