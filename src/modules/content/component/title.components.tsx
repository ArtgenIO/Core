import { Select, Tag } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { modulesAtom, schemasAtom } from '../../admin/admin.atoms';
import { ISchema } from '../../schema';

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
    <ErrorBoundary>
      <Select
        value={assignedModuleId}
        bordered={false}
        className="text-4xl"
        size="large"
        placeholder="$Root"
        onSelect={(selected: string) => {
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
        <Select.Option key={null} value={null}>
          <span className="text-midnight-500">$Root</span>
        </Select.Option>
      </Select>

      {schema.title}

      <span className="ml-4">
        {schema.tags.map(t => (
          <Tag key={t} color="magenta">
            {t}
          </Tag>
        ))}
      </span>
    </ErrorBoundary>
  );
}
