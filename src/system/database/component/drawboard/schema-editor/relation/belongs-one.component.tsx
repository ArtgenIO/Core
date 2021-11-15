import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, List, Popconfirm, Select, Tooltip } from 'antd';
import { camelCase, cloneDeep, snakeCase, upperFirst } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ISchema } from '../../../../../../content/schema';
import { IRelation } from '../../../../../../content/schema/interface/relation.interface';
import {
  getTakenColumNames,
  isPrimary,
} from '../../../../../../content/schema/util/is-primary';

export default function RelationBelongsToOne({
  relation,
  setSchema,
  idx,
  schemas,
}: {
  relation: IRelation;
  setSchema: Dispatch<SetStateAction<ISchema>>;
  idx: number;
  schemas: ISchema[];
}) {
  const [name, setName] = useState(relation.name);
  const [remoteField, setRemoteField] = useState<string>(relation.remoteField);
  const [localField, setLocalField] = useState<string>(relation.localField);

  useEffect(() => {
    setRemoteField(relation.remoteField);
    setLocalField(relation.localField);
  }, [idx]);

  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          <Avatar
            shape="square"
            size="large"
            className="bg-yellow-500"
            icon={
              <span className="material-icons-outlined">settings_ethernet</span>
            }
          />
        }
        description="Belongs To One"
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
                const remoteField = schemas
                  .find(rs => rs.reference === newTarget)
                  .fields.find(isPrimary).reference;

                s.relations[idx].target = newTarget;
                s.relations[idx].remoteField = remoteField;

                setRemoteField(remoteField);

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

                let localName =
                  snakeCase(newName) + upperFirst(snakeCase(remoteField));

                s.relations[idx].localField = localName;
                setLocalField(localName); // Just preset
                s.relations[idx].name = newName;
                setName(newName);

                console.log(s.relations[idx]);

                return s;
              });
            }}
          >
            {schemas.map(opt => {
              const primaries = opt.fields.filter(isPrimary).length;

              if (primaries === 1) {
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
          <Tooltip
            title="Local field name, will be added to the schema before generation"
            placement="bottom"
          >
            <Input
              value={localField}
              disabled={!relation.target}
              placeholder="Local field"
              addonAfter={
                <span className="material-icons-outlined text-sm">anchor</span>
              }
              className="mr-2 w-64"
              onChange={e => {
                setLocalField(e.target.value);
                setSchema(s => {
                  s.relations[idx].localField = e.target.value;

                  return s;
                });
              }}
            />
          </Tooltip>
        </div>

        <div className="hidden">
          <Tooltip
            title="Target schema's primary key, automaticaly selected"
            placement="bottom"
          >
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
