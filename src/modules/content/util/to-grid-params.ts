import parser from 'odata-parser';
import { IODataAST } from '../../rest/interface/odata-ast.interface';

export const toGridParams = (params: URLSearchParams) => {
  // '$top', '$skip', '$select', '$filter', '$expand', '$orderby'

  const emulator = new URLSearchParams();

  if (params.has('orderby')) {
    emulator.set('$orderby', params.get('orderby'));
  }

  const ast: IODataAST = parser.parse(decodeURIComponent(emulator.toString()));

  console.log('AST', ast);
};
