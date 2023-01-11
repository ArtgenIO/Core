import { SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Input,
  List,
  message,
  Select,
  Switch,
} from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import camelCase from 'lodash.camelcase';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import snakeCase from 'lodash.snakecase';
import startCase from 'lodash.startcase';
import upperFirst from 'lodash.upperfirst';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  FieldTool,
  getTakenColumNames,
  isPrimary,
} from '../../../../../../api/library/field-tools';
import { createEmptySchema } from '../../../../../../api/library/get-new-schema';
import { FieldTag } from '../../../../../../api/types/field-tags.enum';
import {
  IRelation,
  IRelationBelongsToMany,
} from '../../../../../../api/types/relation.interface';
import { ISchema } from '../../../../../../models/schema.interface';
import { schemasAtom } from '../../../../atoms/admin.atoms';

type Props = {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
  immutableRelation: IRelationBelongsToMany;
  onClose: (relation: IRelation) => void;
};

export default function RelationBelongsToMany({
  onClose,
  schema,
  setSchema,
  immutableRelation,
}: Props) {
  const [schemas, setSchemas] = useRecoilState(schemasAtom);
  const [relation, setRelation] = useState<IRelationBelongsToMany>(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setRelation(immutableRelation);
  }, [immutableRelation]);

  useEffect(() => {
    if (relation) setIsChanged(!isEqual(relation, immutableRelation));
  }, [relation]);

  const addThroughSchema = (target: string) => {
    const jointName = schema.reference + ' to ' + target;
    const targetSchema = schemas.find(
      s => s.database === schema.database && s.reference === target,
    );

    const nts = createEmptySchema(schema.database);
    nts.title = startCase(jointName);
    nts.tableName = snakeCase(jointName);
    nts.reference = camelCase(jointName);

    const localPrimary = schema.fields.find(FieldTool.isPrimary);
    const remotePrimary = targetSchema.fields.find(FieldTool.isPrimary);

    const crossFieldLocal = FieldTool.createNew(
      schema.reference + ' ' + localPrimary.reference,
    );
    const crossFieldRemote = FieldTool.createNew(
      targetSchema.reference + ' ' + remotePrimary.reference,
    );

    crossFieldLocal.type = localPrimary.type;
    crossFieldRemote.type = remotePrimary.type;

    crossFieldLocal.tags = [FieldTag.PRIMARY];
    crossFieldRemote.tags = [FieldTag.PRIMARY];

    nts.fields = [crossFieldLocal, crossFieldRemote];

    setSchemas(oldSchemas => {
      const newSchemas = cloneDeep(oldSchemas);
      newSchemas.push(nts);
      return newSchemas;
    });

    message.success(`Cross table [${nts.title}] has been created`);
  };

  return (
    relation && (
      <Drawer
        width={640}
        open
        onClose={() => onClose(relation)}
        title={
          <div className="flex w-full">
            <div className="grow">Belongs To Many » {relation.name}</div>
            <div className="shrink">
              {isChanged && (
                <div className="-mt-1">
                  <Button
                    className="text-yellow-500 border-yellow-500 hover:text-yellow-200 hover:border-yellow-200"
                    block
                    icon={<SaveOutlined />}
                    onClick={() => setRelation(immutableRelation)}
                  >
                    Restore Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        }
      >
        <Form className="px-4" layout="vertical">
          <FormItem label="Target Schema">
            <Select
              value={relation.target}
              placeholder="Select Target"
              showSearch
              onChange={newTarget => {
                setRelation(oldState => {
                  const newState = cloneDeep(oldState);
                  const remoteField = schemas
                    .find(rs => rs.reference === newTarget)
                    .fields.find(isPrimary).reference;

                  newState.target = newTarget;
                  newState.remoteField = remoteField;

                  const usedNames = getTakenColumNames(schema);
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

                  newState.name = newName;
                  newState.localField = schema.fields.find(
                    FieldTool.isPrimary,
                  ).reference;

                  addThroughSchema(newTarget);

                  return newState;
                });
              }}
            >
              {schemas
                .filter(s => s.database === schema.database)
                .map(opt => {
                  const primaries = opt.fields.filter(isPrimary).length;

                  if (primaries === 1) {
                    return (
                      <Select.Option key={opt.reference} value={opt.reference}>
                        {opt.title}
                      </Select.Option>
                    );
                  }

                  return undefined;
                })}
            </Select>
          </FormItem>

          <FormItem label="Remote Field (Target's primary key)">
            <Input
              value={relation.remoteField}
              disabled
              readOnly
              placeholder="Remote field"
              addonAfter={<span className="material-icons-outlined">key</span>}
            />
          </FormItem>

          <FormItem label="Local Field (Local Primary key)">
            <Input
              value={relation.localField}
              disabled
              placeholder="Local field"
              addonAfter={
                <span className="material-icons-outlined text-sm">anchor</span>
              }
            />
          </FormItem>

          <FormItem label="Local Reference">
            <Input
              placeholder="Referencing Name"
              value={relation.name}
              onChange={e => {
                setRelation(oldState => {
                  const newState = cloneDeep(oldState);
                  newState.name = e.target.value;
                  return newState;
                });
              }}
            />
          </FormItem>

          <FormItem label="Cascade Behavior">
            <List size="small" bordered>
              <List.Item
                actions={[
                  <Switch key="onUpdate" checked={false} onChange={v => {}} />,
                ]}
              >
                <List.Item.Meta title="Update this record when the referenced record's primary key is changed" />
              </List.Item>
              <List.Item
                actions={[
                  <Switch key="onDelete" checked={false} onChange={v => {}} />,
                ]}
              >
                <List.Item.Meta title="Delete this record too when the referenced record is removed" />
              </List.Item>
            </List>
          </FormItem>
        </Form>
      </Drawer>
    )
  );
}
