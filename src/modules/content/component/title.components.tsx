import { StarOutlined } from '@ant-design/icons';
import { Select, Tag } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { modulesAtom, schemasAtom } from '../../admin/admin.atoms';
import { ISchema } from '../../schema';
import { fSchema } from '../../schema/util/filter-schema';
import './title.component.less';

type Props = {
  schema: ISchema;
};

export default function TitleComponent({ schema }: Props) {
  const [assignedModuleId, setAssignedModuleId] = useState(null);
  const modules = useRecoilValue(modulesAtom);
  const setSchemas = useSetRecoilState(schemasAtom);

  useEffect(() => {
    if (schema) {
      setAssignedModuleId(schema.moduleId);
    }
  }, [schema]);

  return (
    <>
      <div className="flex items-center">
        <div className="shrink">
          <div
            onClick={() => {
              setSchemas(oldState => {
                const newState = cloneDeep(oldState);
                const newSchema = newState.find(fSchema(schema));

                if (!newSchema?.meta) {
                  newSchema.meta = {};
                }

                newSchema.meta.isFavorite = !newSchema.meta?.isFavorite;
                return newState;
              });
            }}
            className={
              'favorite-button ' +
              (schema?.meta?.isFavorite ? ' is-favorite' : '')
            }
          >
            <StarOutlined />
          </div>
        </div>

        <div>
          <Select
            value={assignedModuleId}
            bordered={false}
            className="text-4xl"
            size="large"
            placeholder="$Root"
            onSelect={(selected: string) => {
              selected = selected === '$NULL' ? null : selected;

              if (selected !== assignedModuleId) {
                setAssignedModuleId(selected);

                setSchemas(currentState => {
                  const newState = cloneDeep(currentState);

                  newState.find(
                    s =>
                      s.database === schema.database &&
                      s.reference === schema.reference,
                  ).moduleId = selected;

                  return newState;
                });
              }
            }}
          >
            {modules.map(m => (
              <Select.Option key={m.id} value={m.id}>
                {m.name}
              </Select.Option>
            ))}
            <Select.Option key={'$NULL'} value={'$NULL'}>
              <span className="text-midnight-500">$Root</span>
            </Select.Option>
          </Select>
        </div>

        <div className="test--content-title">{schema.title}</div>

        <div className="ml-2 leading-none text-sm">
          {schema.tags.map(t => (
            <Tag key={t} color="magenta">
              {t}
            </Tag>
          ))}
        </div>
      </div>
    </>
  );
}
