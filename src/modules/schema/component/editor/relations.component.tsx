import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  List,
  message,
  Result,
  Spin,
  Tag,
  TagProps,
  Typography
} from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import cloneDeep from 'lodash.clonedeep';
import snakeCase from 'lodash.snakecase';
import startCase from 'lodash.startcase';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldTag, ISchema } from '../..';
import { schemasAtom } from '../../../admin/admin.atoms';
import { IRelation, RelationType } from '../../interface/relation.interface';
import { isPrimary } from '../../util/field-tools';
import { migrateField } from '../../util/migrate-field';
import RelationBelongsToOne from './relation/belongs-one.component';
import RelationBelongsToMany from './relation/belongs-to-many.component';
import RelationHasMany from './relation/has-many.component';
import RelationHasOne from './relation/has-one.component';

type Props = {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
  isNewSchema: boolean;
};

export default function RelationsComponent({
  schema,
  setSchema,
  isNewSchema,
}: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const [primaryKeyCount, setPrimaries] = useState(0);
  const [showEditor, setShowEditor] = useState<JSX.Element>(null);

  useEffect(() => {
    if (schema) {
      setPrimaries(schema.fields.filter(isPrimary).length);
    }
  }, [schema]);

  const doCreate = (newRelation: IRelation | null) => {
    if (newRelation && newRelation.name !== 'new relation') {
      setSchema(oldSchema => {
        const newSchema = cloneDeep(oldSchema);
        newSchema.relations.push(newRelation);

        // Has to create the local field for it
        if (newRelation.kind === RelationType.BELONGS_TO_ONE) {
          if (
            !newSchema.fields.some(f => f.reference === newRelation.localField)
          ) {
            const newField = migrateField(
              {
                reference: newRelation.localField,
                columnName: snakeCase(newRelation.localField),
                title: startCase(newRelation.localField),
                type: schemas
                  .find(
                    s =>
                      schema.database === s.database &&
                      s.reference === newRelation.target,
                  )
                  .fields.find(f => f.reference === newRelation.remoteField)
                  .type,
                defaultValue: null,
                meta: {},
                args: {},
                tags: [FieldTag.INDEX],
              },
              schema.fields.length,
            );

            // TODO delete local field on delete
            newSchema.fields.push(newField);
          }
        }

        return newSchema;
      });
    }

    setShowEditor(null);
  };

  const addNewRelation = (type: RelationType) => {
    let relation: IRelation;
    const primary = schema.fields.find(isPrimary).reference;

    switch (type) {
      case RelationType.BELONGS_TO_ONE:
        relation = {
          kind: type,
          name: 'new relation',
          target: null,
          localField: '',
          remoteField: '',
        };
        setShowEditor(
          <RelationBelongsToOne
            immutableRelation={relation}
            schema={schema}
            setSchema={setSchema}
            onClose={newState => {
              doCreate(newState);
              setShowEditor(null);
            }}
          />,
        );
        break;
      case RelationType.BELONGS_TO_MANY:
        relation = {
          kind: type,
          name: 'new relation',
          target: null,
          localField: primary,
          remoteField: null,
          through: null,
          throughLocalField: snakeCase(`${schema.reference} ${primary}`),
          throughRemoteField: null,
        };
        setShowEditor(
          <RelationBelongsToMany
            immutableRelation={relation}
            schema={schema}
            setSchema={setSchema}
            onClose={newState => {
              doCreate(newState);
              setShowEditor(null);
            }}
          />,
        );
        break;
      case RelationType.HAS_MANY:
        relation = {
          kind: type,
          name: 'new relation',
          target: null,
          localField: primary,
          remoteField: null,
        };
        setShowEditor(
          <RelationHasMany
            immutableRelation={relation}
            immutableSchema={schema}
            onClose={newState => {
              doCreate(newState);
              setShowEditor(null);
            }}
          />,
        );
        break;
      case RelationType.HAS_ONE:
        relation = {
          kind: type,
          name: 'new relation',
          target: null,
          localField: primary,
          remoteField: null,
        };
        setShowEditor(
          <RelationHasOne
            immutableRelation={relation}
            immutableSchema={schema}
            onClose={newState => {
              doCreate(newState);
              setShowEditor(null);
            }}
          />,
        );
        break;
    }
  };

  if (primaryKeyCount > 1) {
    return (
      <Result
        status="500"
        title="Primary Key Restriction"
        subTitle="Sorry, currently you can only create external relations if the schema has one primary key."
      />
    );
  } else if (primaryKeyCount < 1) {
    return (
      <Result
        status="500"
        title="Primary Key Restriction"
        subTitle="Sorry, first you need to define a primary key."
      />
    );
  }

  if (!schemas) {
    return <Spin />;
  }

  return (
    <ErrorBoundary>
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
          const target = schemas.find(
            s =>
              s.database === schema.database && s.reference === relation.target,
          );

          let color: TagProps['color'];
          let icon: string;
          let onEdit: () => void;

          const doUpdate = (newState: IRelation | null) => {
            setSchema(oldSchema => {
              const newSchema = cloneDeep(oldSchema);
              if (!newState) {
                newSchema.relations.splice(k, 1);
              } else {
                newSchema.relations.splice(k, 1, newState);
              }
              return newSchema;
            });
          };

          switch (relation.kind) {
            case RelationType.BELONGS_TO_ONE:
              color = 'yellow';
              icon = 'compare_arrows';
              onEdit = () =>
                setShowEditor(
                  <RelationBelongsToOne
                    immutableRelation={relation}
                    schema={schema}
                    setSchema={setSchema}
                    onClose={newState => {
                      doUpdate(newState);
                      setShowEditor(null);
                    }}
                  />,
                );
              break;
            case RelationType.BELONGS_TO_MANY:
              color = 'green';
              icon = 'compare_arrows';
              onEdit = () =>
                setShowEditor(
                  <RelationBelongsToMany
                    immutableRelation={relation}
                    schema={schema}
                    setSchema={setSchema}
                    onClose={newState => {
                      doUpdate(newState);
                      setShowEditor(null);
                    }}
                  />,
                );
              break;
            case RelationType.HAS_ONE:
              color = 'blue';
              icon = 'arrow_right_alt';
              onEdit = () =>
                setShowEditor(
                  <RelationHasOne
                    immutableRelation={relation}
                    immutableSchema={schema}
                    onClose={newState => {
                      doUpdate(newState);
                      setShowEditor(null);
                    }}
                  />,
                );
              break;
            case RelationType.HAS_MANY:
              color = 'purple';
              icon = 'arrow_left_alt';
              onEdit = () =>
                setShowEditor(
                  <RelationHasMany
                    immutableRelation={relation}
                    immutableSchema={schema}
                    onClose={newState => {
                      doUpdate(newState);
                      setShowEditor(null);
                    }}
                  />,
                );
              break;
          }

          return (
            <List.Item
              key={`relation-${k}`}
              actions={[
                <Button
                  key="delete"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={e => {
                    e.stopPropagation();

                    setSchema(oldSchema => {
                      const newSchema = cloneDeep(oldSchema);

                      // Has to delete the local field as well
                      if (relation.kind === RelationType.BELONGS_TO_ONE) {
                        newSchema.fields = newSchema.fields.filter(
                          f => f.reference !== relation.localField,
                        );

                        message.warning(
                          `Relation's local field [${relation.localField}] removed`,
                        );
                      }

                      // Delete the relation
                      newSchema.relations = newSchema.relations.filter(
                        r => r.name !== relation.name,
                      );

                      message.warning(`Relation [${relation.name}] removed`);

                      return newSchema;
                    });
                  }}
                ></Button>,
              ]}
              onClick={() => onEdit()}
            >
              <List.Item.Meta
                avatar={
                  <span className="material-icons-outlined bg-midnight-800 p-2.5 rounded-sm w-11 h-11">
                    {icon}
                  </span>
                }
                title={
                  <span className="text-xl font-thin">{relation.name}</span>
                }
                description={`Remote target is [${target.title}] schema`}
              />

              <Tag color={color}>{startCase(relation.kind)}</Tag>
            </List.Item>
          );
        }}
      ></List>

      <div className="mt-4 flex">
        <Button
          ghost
          block
          key="has-one"
          size="middle"
          type="dashed"
          onClick={() => addNewRelation(RelationType.BELONGS_TO_ONE)}
          className="hover:text-yellow-400 mr-2"
        >
          Add Belongs To One Relation
        </Button>
        <Button
          disabled={isNewSchema}
          ghost
          block
          key="has-many"
          size="middle"
          type="dashed"
          onClick={() => addNewRelation(RelationType.BELONGS_TO_MANY)}
          className="hover:text-green-400 mr-2"
        >
          Add Belongs To Many Relation
        </Button>
      </div>
      <div className="mt-4 flex">
        <Button
          disabled={isNewSchema}
          ghost
          block
          key="has-one"
          size="middle"
          type="dashed"
          onClick={() => addNewRelation(RelationType.HAS_ONE)}
          className="hover:text-purple-400 mr-2"
        >
          Add Has One Relation
        </Button>
        <Button
          disabled={isNewSchema}
          ghost
          block
          key="has-many"
          size="middle"
          type="dashed"
          onClick={() => addNewRelation(RelationType.HAS_MANY)}
          className="hover:text-pink-400 mr-2"
        >
          Add Has Many Relation
        </Button>
      </div>
      {showEditor}
    </ErrorBoundary>
  );
}
