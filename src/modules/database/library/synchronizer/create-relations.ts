import { ISchema } from '../../../schema';
import { RelationKind } from '../../../schema/interface/relation.interface';
import { IDatabaseLink } from '../../interface';
import { QueryInstruction } from './query-plan';

const fColumns = (s: ISchema) => (ref: string[]) =>
  s.fields.filter(f => ref.includes(f.reference)).map(f => f.columnName);

export const createRelations = (
  schema: ISchema,
  link: IDatabaseLink,
): QueryInstruction[] => {
  return [
    {
      type: 'foreign',
      query: link.connection.schema.alterTable(schema.tableName, table => {
        schema.relations.forEach(rel => {
          /**
           * @example Product belongsTo Category, local field is Product.category_id remote field is Category.id
           * @example User hasOne Avatar, local field is User.id remote field is Avatar.user_id
           * @example Customer hasMany Order, local field is Customer.id remote field is Order.customer_id
           */
          if (rel.kind == RelationKind.BELONGS_TO_ONE) {
            const target = link.getSchema(rel.target);

            table
              .foreign(fColumns(schema)([rel.localField]))
              .references(fColumns(target)([rel.remoteField]))
              .inTable(target.tableName);
          }

          /**
           * @example Product hasManyThroughMany Orders through the OrderEntry, local field is Product.id -> OrderEntry.product_id && OrderEntry.order_id -> Order.id
           */
          if (rel.kind == RelationKind.BELONGS_TO_MANY) {
            // TODO implement
          }
        });
      }),
    },
  ];
};
