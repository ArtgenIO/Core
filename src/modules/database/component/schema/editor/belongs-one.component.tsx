import { PlusSquareOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, List, Select, Switch } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

import camelCase from 'lodash.camelcase';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import snakeCase from 'lodash.snakecase';
import startCase from 'lodash.startcase';
import upperFirst from 'lodash.upperfirst';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { schemasAtom } from '../../../../admin/admin.atoms';
import { IField } from '../../../types/field.interface';
import { IRelation } from '../../../types/relation.interface';
import { ISchema } from '../../../types/schema.interface';
import {
  FieldTool,
  getTakenColumNames,
  isPrimary,
} from '../../../utils/field-tools';
import { migrateField } from '../../../utils/migrate-field';
import FieldEditor from './field-editor.component';

type Props = {
  schema: ISchema;
  setSchema: Dispatch<SetStateAction<ISchema>>;
  immutableRelation: IRelation;
  onClose: (relation: IRelation) => void;
};

export default function RelationBelongsToOne({
  onClose,
  schema,
  setSchema,
  immutableRelation,
}: Props) {
  const schemas = useRecoilValue(schemasAtom);
  const [relation, setRelation] = useState<IRelation>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [fieldEditor, setFieldEditor] = useState<IField>(null);

  const filterSameButNotPrimary = (targetPrimary: IField) => (field: IField) =>
    field.type === targetPrimary.type && !FieldTool.isPrimary(field);

  const getTargetPrimary = (target: string) =>
    schemas
      .find(s => s.database === schema.database && s.reference === target)
      .fields.find(FieldTool.isPrimary);

  const getLinkableFields = (target: string) =>
    schema.fields.filter(filterSameButNotPrimary(getTargetPrimary(target)));

  useEffect(() => {
    setRelation(immutableRelation);
  }, [immutableRelation]);

  useEffect(() => {
    if (relation) setIsChanged(!isEqual(relation, immutableRelation));
  }, [relation]);

  const addNewField = (name: string, target: string) => {
    const fieldKeys = schema.fields.map(f => f.reference);
    let fieldKey = 0;

    while (++fieldKey) {
      if (!fieldKeys.includes(`newField${fieldKey}`)) {
        break;
      }
    }

    const jointName = target + ' ' + getTargetPrimary(target).columnName;

    const newField = migrateField(
      {
        reference: camelCase(jointName),
        columnName: snakeCase(jointName),
        title: startCase(jointName),
        type: getTargetPrimary(target).type,
        defaultValue: null,
        meta: {},
        args: {},
        tags: [],
      },
      schema.fields.length,
    );

    setFieldEditor(newField);
  };

  return (
    relation && (
      <Drawer
        width={640}
        open
        onClose={() => onClose(relation)}
        title={
          <div className="flex w-full">
            <div className="grow">Belongs To One » {relation.name}</div>
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
                  //newState.localField = snakeCase(newName + ' ' + remoteField);

                  if (!getLinkableFields(newTarget).length) {
                    addNewField(newName, newTarget);
                  }

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

          <FormItem label="Remote Field" className="hidden">
            <Input
              value={relation.remoteField}
              disabled
              readOnly
              placeholder="Remote field"
              addonAfter={<span className="material-icons-outlined">key</span>}
            />
          </FormItem>

          <FormItem label="Local Field (Reference)">
            <div className="flex">
              <div className="grow">
                <Select
                  className="border-r-0 rounded-r-none"
                  disabled={!relation.target}
                  value={relation.localField}
                  placeholder="Please select the local field or create one"
                  onSelect={(selected: string) => {
                    setRelation(oldState =>
                      Object.assign(cloneDeep(oldState), {
                        localField: selected,
                      } as Pick<IRelation, 'localField'>),
                    );
                  }}
                >
                  {relation.target &&
                    getLinkableFields(relation.target).map(f => (
                      <Select.Option key={f.reference} value={f.reference}>
                        {f.title}
                      </Select.Option>
                    ))}
                </Select>
              </div>
              <div className="shrink">
                <Button
                  className="border-l-0 rounded-l-none"
                  disabled={!relation.target}
                  type="primary"
                  onClick={() => addNewField(relation.name, relation.target)}
                  icon={<PlusSquareOutlined />}
                ></Button>
              </div>
            </div>
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
        {fieldEditor && (
          <FieldEditor
            immutableField={fieldEditor}
            immutableSchema={schema}
            onClose={newField => {
              if (newField) {
                setSchema(currentSchema => {
                  const newSchema = cloneDeep(currentSchema);
                  const fIndex = newSchema.fields.findIndex(
                    f => f.reference === fieldEditor.reference,
                  );

                  if (fIndex != -1) {
                    newSchema.fields.splice(fIndex, 1, newField);
                  } else {
                    newSchema.fields.push(newField);
                  }

                  return newSchema;
                });

                setRelation(oldRelation => {
                  const newRelation = cloneDeep(oldRelation);
                  newRelation.localField = newField.reference;
                  return newRelation;
                });
              }

              setFieldEditor(null);
            }}
            isNewSchema={schema.reference === '__new_schema'}
          />
        )}
      </Drawer>
    )
  );
}
