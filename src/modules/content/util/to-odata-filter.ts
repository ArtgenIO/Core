import isArray from 'lodash.isarray';
import FilterBuilder from 'odata-query-builder';
import { JsonItem } from 'react-awesome-query-builder';
import { IODataOperator } from '../../rest/interface/odata-op.interface';

export const toODataFilter = (
  builder: FilterBuilder,
  filter: JsonItem,
  isInverted: boolean = false,
): FilterBuilder => {
  // Nesting with groups
  if (filter.type === 'group') {
    if (filter.children1) {
      // Splitter for OR / AND conjunctions
      let op: 'or' | 'and' =
        filter.properties?.conjunction === 'OR' ? 'or' : 'and';

      // All rule in the group is inverted
      let inverted = filter.properties?.not ?? false;

      // Start the nesting
      builder[op](gBuilder => {
        let children = filter.children1;

        // Can be and array of filters
        if (isArray(children)) {
          children = children as [JsonItem];

          for (const child of children) {
            toODataFilter(gBuilder, child, inverted);
          }
        } else {
          // [id]: JsonItem schemantics
          for (const id in children) {
            if (Object.prototype.hasOwnProperty.call(children, id)) {
              toODataFilter(gBuilder, children[id], inverted);
            }
          }
        }

        return gBuilder;
      });
    }
  } else if (filter.type === 'rule') {
    let op: IODataOperator;

    // Empty rule
    if (!filter.properties?.operator) {
      return builder;
    }

    switch (filter.properties.operator) {
      case 'equal':
        op = !isInverted ? 'eq' : 'ne';
        break;
      case 'not_equal':
        op = !isInverted ? 'ne' : 'eq';
        break;
      case 'greater':
        op = !isInverted ? 'gt' : 'lt';
        break;
      case 'less':
        op = !isInverted ? 'lt' : 'gt';
        break;
      case 'greater_or_equal':
        op = !isInverted ? 'ge' : 'le';
        break;
      case 'less_or_equal':
        op = !isInverted ? 'le' : 'ge';
        break;
      default:
        console.error('Could not convert filter:', filter);
        throw new Error(`Unsupported operator [${op}]`);
    }

    // Value is not yet chosen
    if (
      typeof filter.properties.value[0] === 'undefined' ||
      filter.properties.value[0].toString().length < 1
    ) {
      return builder;
    }

    builder.filterExpression(
      filter.properties.field,
      op,
      filter.properties.value[0],
    );
  }

  return builder;
};
