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
import upperFirst from 'lodash.upperfirst';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IField, ISchema } from '../../..';
import { schemasAtom } from '../../../../admin/admin.atoms';
import { IRelation } from '../../../interface/relation.interface';
import {
  FieldTool,
  getTakenColumNames,
  isPrimary,
} from '../../../util/field-tools';

type Props = {
  immutableSchema: ISchema;
  immutableRelation: IRelation;
  onClose: (relation: IRelation) => void;
};

export default function RelationHasOne({
  immutableSchema,
  immutableRelation,
  onClose,
}: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const [relation, setRelation] = useState<IRelation>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [primary, setPrimary] = useState<IField>(null);

  const sameButNotPrimary = (field: IField) =>
    field.type === primary.type && !FieldTool.isPrimary(field);

  useEffect(() => {
    setRelation(immutableRelation);
    setPrimary(immutableSchema.fields.find(isPrimary));
  }, [immutableRelation]);

  useEffect(() => {
    if (relation) setIsChanged(!isEqual(relation, immutableRelation));
  }, [relation]);

  return (
    relation && (
      <Drawer
        width={640}
        open
        onClose={() => onClose(relation)}
        title={
          <div className="flex w-full">
            <div className="grow">Has One » {relation.name}</div>
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
                  const usedNames = getTakenColumNames(immutableSchema);
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
                  newState.target = newTarget;
                  newState.remoteField = schemas
                    .find(s => s.reference === newTarget)
                    .fields.find(sameButNotPrimary).reference;

                  return newState;
                });
              }}
            >
              {schemas
                .filter(s => s.database === immutableSchema.database)
                .map(other => {
                  // Same type remote field which is not the primary key
                  const sameType = other.fields.some(sameButNotPrimary);

                  if (sameType) {
                    return (
                      <Select.Option
                        key={other.reference}
                        value={other.reference}
                      >
                        {other.title}
                      </Select.Option>
                    );
                  }

                  return undefined;
                })}
            </Select>
          </FormItem>

          <FormItem label="Remote Field" className="hidden">
            <Select
              value={relation.remoteField}
              placeholder="Remote field"
              showSearch
              suffixIcon={<span className="material-icons-outlined">key</span>}
              onSelect={(newRemoteField: string) => {
                setRelation(oldState => {
                  const newState = cloneDeep(oldState);
                  newState.remoteField = newRemoteField;
                  return newState;
                });
              }}
            >
              {relation.target &&
                schemas
                  .find(s => s.reference === relation.target)
                  .fields.filter(sameButNotPrimary)
                  .map(field => (
                    <Select.Option
                      key={field.reference}
                      value={field.reference}
                    >
                      {field.title}
                    </Select.Option>
                  ))}
            </Select>
          </FormItem>

          <FormItem label="Local Field (Primary Key)">
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
                  const usedNames = getTakenColumNames(immutableSchema);
                  const newState = cloneDeep(oldState);

                  if (usedNames.includes(e.target.value)) {
                    message.warn(`Name [${e.target.value}] is already in use!`);
                  } else {
                    newState.name = e.target.value;
                  }

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
