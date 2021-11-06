import { Model, ModelCtor } from 'sequelize';
import { ISchema } from '../../../content/schema';

export interface ILink {
  model<T = unknown>(schema: string): ModelCtor<Model<T, T>>;
  manage(schemas: ISchema[]): Promise<void>;
}
