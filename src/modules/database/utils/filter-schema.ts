import { ISchema } from '../types/schema.interface';

export const fSchema = (subject: ISchema) => (compare: ISchema) =>
  subject.database === compare.database &&
  subject.reference === compare.reference;
