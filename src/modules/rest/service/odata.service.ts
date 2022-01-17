import { merge, pick } from 'lodash';
import { Model, ModelClass, Operator, QueryBuilder } from 'objection';
import parser from 'odata-parser';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { ILogger, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { FieldType, ISchema } from '../../schema';
import { IODataAST } from '../interface/odata-ast.interface';

type QB = QueryBuilder<Model, Model[]>;
type AST = IODataAST;

@Service()
export class ODataService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  /**
   * Map OData operator to SQL operators
   */
  protected mapOperator(op: string): Operator {
    switch (op) {
      case 'eq':
        return '=';
      case 'ne':
        return '!=';
      case 'lt':
        return '<';
      case 'le':
        return '<=';
      case 'gt':
        return '>';
      case 'ge':
        return '>=';
    }

    throw new Exception(`Unknown [${op}] operator`);
  }

  /**
   * Apply the $filter segment
   */
  protected applyConditions(schema: ISchema, qb: QB, $filter: AST['$filter']) {
    const svc = this;

    switch ($filter.type) {
      case 'eq':
      case 'ne':
      case 'lt':
      case 'le':
      case 'gt':
      case 'ge':
        qb.where(
          schema.fields.find(f => f.reference === $filter.left.name).columnName,
          this.mapOperator($filter.type),
          $filter.right.value,
        );
        break;
      case 'and':
        qb.andWhere(function () {
          svc.applyConditions(schema, this, $filter['left']);
          svc.applyConditions(schema, this, $filter['right']);
        });
        break;
      case 'or':
        qb.orWhere(function () {
          svc.applyConditions(schema, this, $filter['left']);
          svc.applyConditions(schema, this, $filter['right']);
        });
        break;
    }
  }

  /**
   * Apply the $select segment.
   */
  protected applySelect(schema: ISchema, qb: QB, $select: AST['$select']) {
    const fieldNames = schema.fields.map(f => f.reference);
    const relationNames = schema.relations.map(r => r.name);
    const fieldSelection = new Set<string>();
    const eagerSelection = new Set<string>();
    const trimmedEager = new Map<string, string[]>();

    for (const item of $select) {
      if (!item.match('/')) {
        // Select from the schema fields
        if (fieldNames.includes(item)) {
          fieldSelection.add(item);
        }
        // Select from relations as whole
        else if (relationNames.includes(item)) {
          eagerSelection.add(item);
        }
        // Select all
        else if (item == '*') {
          fieldNames.forEach(f => fieldSelection.add(f));
        } else {
          throw new Exception(`Unknown selection [${item}]`);
        }
      }
      // Load from relation
      else {
        const relation = item.substring(0, item.indexOf('/'));

        if (relationNames.includes(relation)) {
          qb.withGraphFetched(relation);

          if (!trimmedEager.has(relation)) {
            trimmedEager.set(relation, []);
          }

          trimmedEager.get(relation).push(item.substring(relation.length + 1));
        } else {
          throw new Exception(`Unknown relation [${item}][${relation}]`);
        }
      }
    }

    if (fieldSelection.size) {
      qb.select(
        Array.from(fieldSelection.values()).map(
          fRef => schema.fields.find(f => f.reference == fRef).columnName,
        ),
      );
    }

    if (eagerSelection.size) {
      qb.withGraphFetched(
        `[${Array.from(eagerSelection.values()).join(', ')}]`,
      );
    }

    for (const [rel, selects] of trimmedEager.entries()) {
      qb.modifyGraph(rel, b => {
        b.select(selects);
      });
    }
  }

  protected applyOrderBy(schema: ISchema, qb: QB, $orderby: AST['$orderby']) {
    for (const order of $orderby) {
      for (const fieldRef in order) {
        if (Object.prototype.hasOwnProperty.call(order, fieldRef)) {
          const direction = order[fieldRef];
          const field = schema.fields.find(f => f.reference === fieldRef);

          // Complex types could not be sorted.
          if (field.type === FieldType.JSON || field.type === FieldType.JSONB) {
            continue;
          }

          qb.orderBy(field.columnName, direction);
        }
      }
    }
  }

  /**
   * Convert an OData query into a QueryBuilder for the given schema.
   */
  toQueryBuilder(
    model: ModelClass<Model>,
    schema: ISchema,
    filters: object,
  ): QB {
    // Merge with the defualts, need to pick the valid keys because the lib crashes if non odata params are apssed.
    const options = pick(
      merge(
        {
          $top: 10,
          $skip: 0,
        },
        filters,
      ),
      ['$top', '$skip', '$select', '$filter', '$expand', '$orderby'],
    ) as ParsedUrlQueryInput;

    // Convert it into string (the parser only accepts it in this format)
    const queryString = decodeURIComponent(stringify(options));
    const ast: AST = parser.parse(queryString);
    const qb = model.query();

    // Select X,Y
    if (ast?.$select) {
      this.applySelect(schema, qb, ast.$select);
    }

    if (ast?.$filter) {
      this.applyConditions(schema, qb, ast.$filter);
    }

    if (ast?.$orderby) {
      this.applyOrderBy(schema, qb, ast.$orderby);
    }

    // We allow the -1 to be converted to no limit.
    if (ast?.$top && ast.$top != -1) {
      qb.limit(ast.$top);
    }

    if (ast?.$skip) {
      qb.offset(ast.$skip);
    }

    return qb;
  }
}
