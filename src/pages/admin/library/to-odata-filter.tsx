import FilterBuilder from 'odata-query-builder';
import { JsonItem } from 'react-awesome-query-builder';
import { IODataOperator } from '../../../api/types/odata-op.interface';

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
        filter?.properties?.conjunction === 'OR' ? 'or' : 'and';

      // All rule in the group is inverted
      let inverted = filter.properties?.not ?? false;

      // Start the nesting
      builder[op](gBuilder => {
        let children = filter.children1;

        // Can be and array of filters
        if (Array.isArray(children)) {
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
    // Empty rule
    if (!filter.properties?.operator) {
      return builder;
    }

    let operator = filter.properties.operator;

    // Inversion is always a matched as not_STATEMENT
    if (operator.match(/not_/)) {
      operator = operator.replace(/not_/, '');
      isInverted = !isInverted;
    }

    // Operators without value
    if (['is_empty', 'none', 'some'].includes(operator)) {
      // Allow empty values
    }
    // Value is not yet chosen
    else if (
      typeof filter.properties.value[0] === 'undefined' ||
      filter.properties.value[0].toString().length < 1
    ) {
      return builder;
    }

    const field = filter.properties.field;
    let value = filter.properties.value[0] ?? null;

    // Basic translatable function calls
    if (
      operator === 'like' ||
      operator === 'starts_with' ||
      operator === 'ends_with'
    ) {
      let func: string;

      switch (operator) {
        case 'like':
          func = 'substringof';
          break;
        case 'starts_with':
          func = 'startswith';
          break;
        case 'ends_with':
          func = 'endswith';
          break;
      }

      let phrase = `${func}('${value.replace(/'/g, "''")}', ${field})`;

      // Invert with false comparison
      if (isInverted) {
        phrase = `${phrase} eq false`;
      }

      builder.filterPhrase(phrase);

      return builder;
    }

    let expOp: IODataOperator;

    switch (operator) {
      case 'equal':
      case 'select_equals':
        expOp = !isInverted ? 'eq' : 'ne';
        break;
      case 'not_equal':
        expOp = !isInverted ? 'ne' : 'eq';
        break;
      case 'greater':
        expOp = !isInverted ? 'gt' : 'lt';
        break;
      case 'less':
        expOp = !isInverted ? 'lt' : 'gt';
        break;
      case 'greater_or_equal':
        expOp = !isInverted ? 'ge' : 'le';
        break;
      case 'less_or_equal':
        expOp = !isInverted ? 'le' : 'ge';
        break;

      // Null handling
      case 'none':
        expOp = !isInverted ? 'eq' : 'ne';
        value = null;
        break;
      case 'some':
        expOp = !!isInverted ? 'eq' : 'ne';
        value = null;
        break;

      case 'is_empty':
        expOp = !isInverted ? 'eq' : 'ne';
        value = '';
        break;
      default:
        console.error('Could not convert filter:', filter);
        throw new Error(`Unsupported operator [${expOp}]`);
    }

    // Where COL1 = COL2
    if (filter.properties.valueSrc[0] === 'field') {
      builder.filterPhrase(
        `${field.replace(
          /\./g,
          '/',
        )} ${expOp} ${filter.properties.value[0].replace(/\./g, '/')}`,
      );
    } else {
      builder.filterExpression(field.replace(/\./g, '/'), expOp, value);
    }
  }

  return builder;
};
