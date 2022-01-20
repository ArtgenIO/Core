export enum RelationType {
  HAS_ONE = 'has-one',
  HAS_MANY = 'has-many',
  BELONGS_TO_ONE = 'belongs-to-one',
  BELONGS_TO_MANY = 'belongs-to-many',
}

export interface IRelationHasOne {
  name: string;
  kind: RelationType.HAS_ONE;
  // Target DB,SCHEMA
  target: string;
  // Local primary key
  localField: string;
  // Remote unique key(s)
  remoteField: string;
}

export interface IRelationHasMany {
  name: string;
  kind: RelationType.HAS_MANY;
  // Target DB,SCHEMA
  target: string;
  // Local primary key
  localField: string;
  // Remote unique key(s)
  remoteField: string;
}

export interface IRelationBelongsToOne {
  name: string;
  kind: RelationType.BELONGS_TO_ONE;
  // Target DB,SCHEMA
  target: string;
  // Local indexed key(s)
  localField: string;
  // Remote primary key
  remoteField: string;
}

export interface IRelationBelongsToMany {
  name: string;

  kind: RelationType.BELONGS_TO_MANY;
  // Target DB,SCHEMA
  target: string;
  // Local primary key
  localField: string;
  // Remote compositive primary key's other side
  remoteField: string;
  // The cross schema
  through: string;
  throughLocalField: string;
  throughRemoteField: string;
}

export type IRelation =
  | IRelationHasOne
  | IRelationBelongsToOne
  | IRelationHasMany
  | IRelationBelongsToMany;
