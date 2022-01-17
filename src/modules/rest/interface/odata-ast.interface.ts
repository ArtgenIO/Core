import { IODataOperator } from './odata-op.interface';

type fLogicAnd = {
  type: 'and';
  left: fLogic;
  right: fLogic;
};

type fLogicOr = {
  type: 'or';
  left: fLogic;
  right: fLogic;
};

type fPropery = {
  type: 'property';
  name: string;
};

type fLiteral = {
  type: 'literal';
  value: string;
};

type fLogicCheck = {
  type: IODataOperator;
  left: fPropery;
  right: fLiteral;
};

type fLogicOp = fLogicAnd | fLogicOr;
type fLogic = fLogicCheck | fLogicOp;

export interface IODataAST {
  /**
   * Translates to the LIMIT X
   */
  $top: number;

  /**
   * Translates to the OFFSET X or LIMIT X,Y
   */
  $skip: number;

  /**
   * Translates to the SELECT X,Y
   * Also includes related selections like SELECT table1.X, table2.Y FROM table1 JOIN table2
   */
  $select: string[];

  /**
   * Translates to the ORDER BY field ASC
   * Can have multiple element.
   */
  $orderby: {
    [field: string]: 'asc' | 'desc';
  }[];

  $filter: fLogic;

  /**
   * TODO: what?
   */
  $expand: string[];
}
