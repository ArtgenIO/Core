import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, List, Popconfirm, Select, Tooltip } from 'antd';
import { pluralize } from 'inflection';
import { camelCase, cloneDeep, snakeCase, upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { ISchema } from '../../../../../schema';
import {
  IRelation,
  IRelationManyToMany,
} from '../../../../../schema/interface/relation.interface';
import {
  getTakenColumNames,
  isPrimary,
} from '../../../../../schema/util/field-tools';

export default function RelationManyToMany({
  relation,
  setSchema,
  schema,
  idx,
  schemas,
}: {
  relation: IRelation;
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
  idx: number;
  schemas: ISchema[];
}) {
  const primary = schema.fields.find(isPrimary);
  const [name, setName] = useState(relation.name);
  const [remoteField, setRemoteField] = useState<string>(relation.remoteField);
  const [through, setThrough] = useState<string>(
    (relation as IRelationManyToMany).through,
  );

  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          <Avatar
            shape="square"
            size="large"
            className="bg-blue-500"
            icon={
              <span className="material-icons-outlined">settings_ethernet</span>
            }
          />
        }
        description="Many To Many"
        title={
          <Input
            bordered={false}
            size="large"
            className="text-xl pl-0"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setSchema(s => {
                s.relations[idx].name = e.target.value;
                return s;
              });
            }}
          />
        }
      />

      <div className="flex">
        <div>
          <Select
            defaultValue={relation.target}
            className="mx-2 w-96"
            placeholder="Select Target"
            onChange={newTarget => {
              setSchema(s => {
                const usedNames = getTakenColumNames(s);
                let newName = pluralize(camelCase(newTarget));

                if (usedNames.includes(newName)) {
                  newName = `of${upperFirst(newName)}`;

                  if (usedNames.includes(newName)) {
                    let nameX = 0;

                    while (++nameX) {
                      if (!usedNames.includes(`${newName}${nameX}`)) {
                        newName = `${newName}${nameX}`;
                        break;
                      }
                    }
                  }
                }
                const through =
                  snakeCase(schema.tableName) + '_' + snakeCase(newName);

                const remotePrimary = schemas
                  .find(s => s.reference === newTarget)
                  .fields.find(isPrimary);

                s.relations[idx].name = newName;
                s.relations[idx].target = newTarget;
                s.relations[idx].remoteField = remotePrimary.reference;
                (s.relations[idx] as IRelationManyToMany).through = through;
                setThrough(through);
                setName(newName);
                setRemoteField(s.relations[idx].remoteField);

                return s;
              });
            }}
          >
            {schemas.map(opt => {
              const primaries = opt.fields.filter(isPrimary).length;
              const sameType = opt.fields.some(
                f => f.type === primary.type && !isPrimary(f),
              );

              if (primaries === 1 && sameType) {
                return (
                  <Select.Option key={opt.reference} value={opt.reference}>
                    {opt.label}
                  </Select.Option>
                );
              }

              return undefined;
            })}
          </Select>
        </div>

        <div>
          <Tooltip title="Cross connection table" placement="left">
            <Input
              value={through}
              disabled={!relation.target}
              placeholder="Cross connection table"
              addonAfter={
                <span className="material-icons-outlined text-sm">
                  call_merge
                </span>
              }
              onChange={e => {
                setThrough(e.target.value);
                setSchema(s => {
                  (s.relations[idx] as IRelationManyToMany).through =
                    e.target.value;

                  return s;
                });
              }}
              className="mr-2 w-64"
            />
          </Tooltip>
        </div>

        <div className="hidden">
          <Tooltip title="Target schema's relation key" placement="left">
            <Input
              value={remoteField}
              disabled
              readOnly
              placeholder="Remote field"
              className="w-64"
              addonAfter={<span className="material-icons-outlined">key</span>}
            />
          </Tooltip>
        </div>
      </div>

      <Popconfirm
        title="Are You sure to delete this relation?"
        okText="Yes, delete"
        cancelText="No"
        placement="left"
        icon={<QuestionCircleOutlined />}
        onConfirm={() => {
          setSchema(schema => {
            const newSchema = cloneDeep(schema);
            newSchema.relations.splice(idx, 1);

            return newSchema;
          });
        }}
      >
        <Button
          icon={<DeleteOutlined />}
          className="rounded-md hover:text-red-500 hover:border-red-500"
        ></Button>
      </Popconfirm>
    </List.Item>
  );
}
