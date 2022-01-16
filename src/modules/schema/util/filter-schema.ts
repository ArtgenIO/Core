import { ISchema } from '../interface/schema.interface';

export const fSchema = (subject: ISchema) => (compare: ISchema) =>
  subject.database === compare.database &&
  subject.reference === compare.reference;
