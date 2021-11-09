import { Model, ModelCtor } from 'sequelize';
import { IDatabase } from '.';
import { ISchema } from '../../../content/schema';

export interface ILink {
  readonly database: IDatabase;

  model<T = unknown>(schema: string): ModelCtor<Model<T, T>>;
  manage(schemas: ISchema[]): Promise<void>;
  getSchemas(): ISchema[];
  importExisting(): Promise<ISchema[]>;
}
