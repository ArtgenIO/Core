import { Model, ModelCtor, Sequelize } from 'sequelize';
import { IDatabase } from '.';
import { ISchema } from '../../schema';

export interface ILink {
  readonly database: IDatabase;
  readonly connection: Sequelize;

  model<T = unknown>(schema: string): ModelCtor<Model<T, T>>;
  setSchemas(schemas: ISchema[]): Promise<void>;
  addSchemas(schemas: ISchema[]): Promise<void>;
  getSchemas(): ISchema[];
}
