import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, List, Popconfirm, Select, Tooltip } from 'antd';
import { camelCase, cloneDeep, upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { ICollection } from '../../../../../collection';
import { IRelation } from '../../../../../collection/interface/relation.interface';
import {
  getTakenColumNames,
  isPrimary,
} from '../../../../../collection/util/field-tools';

export default function RelationBelongsToMany({
  relation,
  setSchema,
  schema,
  idx,
  schemas,
}: {
  relation: IRelation;
  schema: ICollection;
  setSchema: Dispatch<SetStateAction<ICollection>>;
  idx: number;
  schemas: ICollection[];
}) {
  const primary = schema.fields.find(isPrimary);
  const [name, setName] = useState(relation.name);
  const [remoteField, setRemoteField] = useState<string>(relation.remoteField);

  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          <Avatar
            shape="square"
            size="large"
            className="bg-green-500"
            icon={
              <span className="material-icons-outlined">settings_ethernet</span>
            }
          />
        }
        description="Belongs To Many"
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
        <div className="hidden">
          <Tooltip
            title="Local field name, will be added to the schema before generation"
            placement="left"
          >
            <Input
              value={relation.localField}
              disabled
              placeholder="Local field"
              addonAfter={
                <span className="material-icons-outlined">anchor</span>
              }
              className="mr-2 w-64"
            />
          </Tooltip>
        </div>

        <div>
          <Select
            defaultValue={relation.target}
            className="mx-2 w-96"
            placeholder="Select Target"
            onChange={newTarget => {
              setSchema(s => {
                const usedNames = getTakenColumNames(s);
                let newName = camelCase(newTarget);

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

                s.relations[idx].name = newName;
                s.relations[idx].target = newTarget;
                s.relations[idx].remoteField = schemas
                  .find(s => s.reference === newTarget)
                  .fields.find(
                    f => f.type === primary.type && !isPrimary(f),
                  ).reference;
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

        <div className="mr-2">
          <Tooltip title="Target schema's relation key" placement="left">
            <Select
              disabled={!relation.target}
              value={remoteField}
              placeholder="Remote field"
              className="w-64"
              onChange={newRemoteField => {
                setSchema(s => {
                  s.relations[idx].remoteField = newRemoteField;
                  setRemoteField(newRemoteField);
                  return s;
                });
              }}
            >
              {relation.target
                ? schemas
                    .find(s => s.reference === relation.target)
                    .fields.filter(f => !isPrimary(f))
                    .filter(f => f.type === primary.type)
                    .map(f => (
                      <Select.Option key={f.reference} value={f.reference}>
                        {f.label}
                      </Select.Option>
                    ))
                : undefined}
            </Select>
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
