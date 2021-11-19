export enum RelationKind {
  HAS_ONE = 'has-one',
  HAS_MANY = 'has-many',
  BELONGS_TO_ONE = 'belongs-to-one',
  BELONGS_TO_MANY = 'belongs-to-many',
  MANY_TO_MANY = 'many-to-many',
}

export interface IRelationHasOne {
  kind: RelationKind.HAS_ONE;
  // Target DB,SCHEMA
  target: string;
  // Local primary key(s) referenced
  localField: string;
  // Remove referenced key(s)
  remoteField: string;
}

export interface IRelationBelongsToOne {
  kind: RelationKind.BELONGS_TO_ONE;
  // Target DB,SCHEMA
  target: string;
  // Local primary key(s) referencing
  localField: string;
  // Remove referenced key(s)
  remoteField: string;
}

export interface IRelationHasMany {
  kind: RelationKind.HAS_MANY;
  // Target DB,SCHEMA
  target: string;
  // Local primary key(s) referenced
  localField: string;
  // Remove referenced key(s)
  remoteField: string;
}

export interface IRelationBelongsToMany {
  kind: RelationKind.BELONGS_TO_MANY;
  // Target DB,SCHEMA
  target: string;
  // Local primary key(s) referenced
  localField: string;
  // Remove referenced key(s)
  remoteField: string;
}

export interface IRelationManyToMany {
  kind: RelationKind.MANY_TO_MANY;
  // Target DB,SCHEMA
  target: string;
  // Local primary key(s) referenced
  localField: string;
  // Remove referenced key(s)
  remoteField: string;
  // The cross table which has the IDs
  through: string;
}

export type IRelation = {
  name: string;
} & (
  | IRelationHasOne
  | IRelationBelongsToOne
  | IRelationHasMany
  | IRelationBelongsToMany
  | IRelationManyToMany
);
