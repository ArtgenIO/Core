import { Button, List, Result, Skeleton, Typography } from 'antd';
import { cloneDeep } from 'lodash';
import { QueryBuilder } from 'odata-query-builder';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useResetRecoilState } from 'recoil';
import { Exception } from '../../../../../app/exceptions/exception';
import { pageDrawerAtom } from '../../../../admin/admin.atoms';
import { useHttpClient } from '../../../../admin/library/use-http-client';
import { routeCrudAPI } from '../../../../content/util/schema-url';
import { ISchema } from '../../../../schema';
import { RelationKind } from '../../../../schema/interface/relation.interface';
import { isPrimary } from '../../../../schema/util/is-primary';
import RelationBelongsToMany from './relation/belongs-many.component';
import RelationBelongsToOne from './relation/belongs-one.component';
import RelationHasMany from './relation/has-many.component';
import RelationHasOne from './relation/has-one.component';
import RelationManyToMany from './relation/many-to-many.component';

export default function RelationsComponent({
  schema,
  setSchema,
}: {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
}) {
  const resetPageDrawler = useResetRecoilState(pageDrawerAtom);
  const [primaries, setPrimaries] = useState(
    schema.fields.filter(isPrimary).length,
  );

  const [{ data: schemas, loading, error }] = useHttpClient<ISchema[]>(
    routeCrudAPI({ database: 'system', reference: 'Schema' }) +
      new QueryBuilder()
        .top(1000)
        .filter(f => f.filterExpression('database', 'eq', schema.database))
        .toQuery(),
    {
      useCache: true,
    },
  );

  useEffect(() => {
    resetPageDrawler();
  }, []);

  const addNewRelation = (kind: RelationKind) => {
    setSchema(s => {
      const newState = cloneDeep(s);

      switch (kind) {
        case RelationKind.BELONGS_TO_ONE:
          newState.relations.push({
            kind,
            name: 'newBelongsToOneRelation',
            target: null,
            localField: '',
            remoteField: '',
          });
          break;
        case RelationKind.BELONGS_TO_MANY:
          newState.relations.push({
            kind,
            name: 'newBelongsToManyRelation',
            target: null,
            localField: s.fields.find(isPrimary).reference,
            remoteField: null,
          });
          break;
        case RelationKind.MANY_TO_MANY:
          newState.relations.push({
            kind,
            name: 'newManyToManyRelation',
            target: null,
            localField: s.fields.find(isPrimary).reference,
            remoteField: null,
            through: null,
          });
          break;
        case RelationKind.HAS_MANY:
          newState.relations.push({
            kind,
            name: 'newHasManyRelation',
            target: null,
            localField: s.fields.find(isPrimary).reference,
            remoteField: null,
          });
          break;
        case RelationKind.HAS_ONE:
          newState.relations.push({
            kind,
            name: 'newHasOneRelation',
            target: null,
            localField: s.fields.find(isPrimary).reference,
            remoteField: null,
          });
          break;
      }

      return newState;
    });
  };

  if (error) {
    throw error;
  }

  if (primaries > 1) {
    return (
      <Result
        status="500"
        title="Primary Key Restriction"
        subTitle="Sorry, currently you can only create external relations if the schema has one primary key."
      />
    );
  } else if (primaries < 1) {
    return (
      <Result
        status="500"
        title="Primary Key Restriction"
        subTitle="Sorry, first you need to define a primary key."
      />
    );
  }

  if (loading || !schemas) {
    return <h1>Loading</h1>;
  }

  return (
    <>
      <Typography className="mb-8">
        <Typography.Paragraph>
          You can connect tables in three diffent way <strong>has one</strong>,{' '}
          <strong>has many</strong>, and <strong>many to many</strong>. With
          this you can ensure data integrity and describe dependencies, which
          can be used to map data between schemas.
        </Typography.Paragraph>
      </Typography>

      <List
        bordered
        size="small"
        dataSource={schema.relations}
        renderItem={(relation, k) => {
          if (relation.kind === RelationKind.BELONGS_TO_ONE) {
            return (
              <RelationBelongsToOne
                schemas={schemas}
                relation={relation}
                idx={k}
                setSchema={setSchema}
              />
            );
          } else if (relation.kind === RelationKind.BELONGS_TO_MANY) {
            return (
              <RelationBelongsToMany
                schemas={schemas}
                schema={schema}
                relation={relation}
                idx={k}
                setSchema={setSchema}
              />
            );
          } else if (relation.kind === RelationKind.MANY_TO_MANY) {
            return (
              <RelationManyToMany
                schemas={schemas}
                schema={schema}
                relation={relation}
                idx={k}
                setSchema={setSchema}
              />
            );
          } else if (relation.kind === RelationKind.HAS_MANY) {
            return (
              <RelationHasMany
                schemas={schemas}
                schema={schema}
                relation={relation}
                idx={k}
                setSchema={setSchema}
              />
            );
          } else if (relation.kind === RelationKind.HAS_ONE) {
            return (
              <RelationHasOne
                schemas={schemas}
                schema={schema}
                relation={relation}
                idx={k}
                setSchema={setSchema}
              />
            );
          }

          throw new Exception(`Unhandled relation kind`);
        }}
      ></List>
      <Skeleton loading={loading}>
        <div className="mt-4 flex">
          <Button
            ghost
            block
            key="has-one"
            size="middle"
            type="dashed"
            onClick={() => addNewRelation(RelationKind.BELONGS_TO_ONE)}
            className="hover:text-yellow-400 mr-2"
          >
            Add Belongs To One Relation
          </Button>
          <Button
            ghost
            block
            key="has-many"
            size="middle"
            type="dashed"
            onClick={() => addNewRelation(RelationKind.BELONGS_TO_MANY)}
            className="hover:text-green-400 mr-2"
          >
            Add Belongs To Many Relation
          </Button>
          <Button
            ghost
            block
            key="many-to-many"
            size="middle"
            type="dashed"
            onClick={() => addNewRelation(RelationKind.MANY_TO_MANY)}
            className="hover:text-blue-400"
          >
            Add Has Many To Many Relation
          </Button>
        </div>
        <div className="mt-4 flex">
          <Button
            ghost
            block
            key="has-one"
            size="middle"
            type="dashed"
            onClick={() => addNewRelation(RelationKind.HAS_ONE)}
            className="hover:text-purple-400 mr-2"
          >
            Add Has One Relation
          </Button>
          <Button
            ghost
            block
            key="has-many"
            size="middle"
            type="dashed"
            onClick={() => addNewRelation(RelationKind.HAS_MANY)}
            className="hover:text-pink-400 mr-2"
          >
            Add Has Many Relation
          </Button>
        </div>
      </Skeleton>
    </>
  );
}
