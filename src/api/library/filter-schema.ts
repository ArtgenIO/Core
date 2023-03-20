import { ISchema } from '../../models/schema.interface';

export const fSchema = (subject: ISchema) => (compare: ISchema) =>
  subject.database === compare.database &&
  subject.reference === compare.reference;
