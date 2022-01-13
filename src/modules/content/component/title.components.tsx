import { message, Select, Tag } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useHttpClientSimple } from '../../admin/library/http-client';
import { ISchema } from '../../schema';
import { IContentModule } from '../interface/content-module.interface';

type Props = {
  modules: IContentModule[];
  schema: ISchema;
};

export default function TitleComponent({ schema, modules }: Props) {
  const httpClient = useHttpClientSimple();
  const [assignedModuleId, setAssignedModuleId] = useState(null);

  useEffect(() => {
    if (schema) {
      setAssignedModuleId(schema.moduleId);
    }
  }, [schema]);

  return (
    <>
      <Select
        value={assignedModuleId}
        bordered={false}
        className="text-4xl"
        size="large"
        placeholder="$ROOT"
        onSelect={selected => {
          if (selected !== assignedModuleId) {
            setAssignedModuleId(selected);

            const patch = cloneDeep(schema);
            patch.moduleId = selected;

            httpClient
              .patch(
                `/api/rest/main/schema/${schema.database}/${schema.reference}`,
                patch,
              )
              .then(() => message.success('Module changed'));
          }
        }}
      >
        {modules.map(m => (
          <Select.Option key={m.id} value={m.id}>
            {m.name}
          </Select.Option>
        ))}
      </Select>

      {schema.title}
      <span className="ml-4">
        {schema.tags.map(t => (
          <Tag key={t}>{t}</Tag>
        ))}
      </span>
    </>
  );
}
