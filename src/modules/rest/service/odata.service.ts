import { merge, pick } from 'lodash';
import { Model, ModelClass, Operator, QueryBuilder } from 'objection';
import parser from 'odata-parser';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { ILogger, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { ISchema } from '../../schema';

@Service()
export class ODataService {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  protected tOperator(op: string): Operator {
    if (op === 'eq') {
      return '=';
    }

    throw new Exception(`Unknown [${op}] operator`);
  }

  protected toConditions(q: QueryBuilder<any>, $filter: any) {
    if ($filter.type == 'eq') {
      q.where(
        $filter.left.name,
        this.tOperator($filter.type),
        $filter.right.value,
      );
    } else if ($filter.type == 'and') {
      const s = this;

      q.andWhere(function () {
        s.toConditions(this, $filter.left);
        s.toConditions(this, $filter.right);
      });
    } else if ($filter.type == 'or') {
      const s = this;

      q.orWhere(function () {
        s.toConditions(this, $filter.left);
        s.toConditions(this, $filter.right);
      });
    }
  }

  toQuery(
    model: ModelClass<Model>,
    schema: ISchema,
    filters: object,
  ): QueryBuilder<Model, Model[]> {
    // Merge with the defualts
    const options = pick(
      merge(
        {
          $top: 10,
          $skip: 0,
        },
        filters,
      ),
      ['$top', '$skip', '$select', '$filter'],
    ) as ParsedUrlQueryInput;

    // Convert it into string (the parser only accepts it in this format)
    const queryString = decodeURIComponent(stringify(options));
    const AST = parser.parse(queryString);
    const query = model.query();

    if (AST?.$filter) {
      this.toConditions(query, AST.$filter);
    }

    if (AST?.$top) {
      query.limit(parseInt(AST.$top, 10));
    }

    if (AST?.$skip) {
      query.offset(parseInt(AST.$skip, 10));
    }

    if (AST?.$select) {
      const fieldNames = schema.fields.map(f => f.reference);
      const relationNames = schema.relations.map(r => r.name);
      const fieldSelection = new Set<string>();
      const eagerSelection = new Set<string>();
      const trimmedEager = new Map<string, string[]>();

      for (const s of AST?.$select as string[]) {
        if (!s.match('/')) {
          // Select from the schema fields
          if (fieldNames.includes(s)) {
            fieldSelection.add(s);
          }
          // Select from relations as whole
          else if (relationNames.includes(s)) {
            eagerSelection.add(s);
          }
          // Select all
          else if (s == '*') {
            fieldNames.forEach(f => fieldSelection.add(f));
          } else {
            throw new Exception(`Unknown selection [${s}]`);
          }
        }
        // Load from relation
        else {
          const rel = s.substring(0, s.indexOf('/'));

          if (relationNames.includes(rel)) {
            query.withGraphFetched(rel);

            if (!trimmedEager.has(rel)) {
              trimmedEager.set(rel, []);
            }

            trimmedEager.get(rel).push(s.substring(rel.length + 1));
          } else {
            throw new Exception(`Unknown relation [${s}][${rel}]`);
          }
        }
      }

      if (fieldSelection.size) {
        query.select(
          Array.from(fieldSelection.values()).map(
            fRef => schema.fields.find(f => f.reference == fRef).columnName,
          ),
        );
      }

      if (eagerSelection.size) {
        query.withGraphFetched(
          `[${Array.from(eagerSelection.values()).join(', ')}]`,
        );
      }

      for (const [rel, selects] of trimmedEager.entries()) {
        query.modifyGraph(rel, b => {
          b.select(selects);
        });
      }
    }

    return query;
  }
}
