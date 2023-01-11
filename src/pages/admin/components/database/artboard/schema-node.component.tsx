import { Handle, NodeProps, Position } from 'reactflow';
import { FieldTool } from '../../../../../api/library/field-tools';
import { FieldTag } from '../../../../../api/types/field-tags.enum';
import { IField } from '../../../../../api/types/field.interface';
import { ISchema } from '../../../../../models/schema.interface';
import Icon from '../../../layout/icon.component';

const isRelationSource = (s: ISchema, f: IField): boolean => {
  return s.relations.some(
    rel => rel.kind.match('belong') && rel.localField == f.reference,
  );
};

const isRelationTarget = (
  schemas: ISchema[],
  target: ISchema,
  field: IField,
): boolean => {
  return schemas.some(remote =>
    remote.relations.some(
      rel =>
        rel.kind.match('belong') &&
        rel.target == target.reference &&
        rel.remoteField == field.reference,
    ),
  );
};

export const createSchemaNode = (
  schemas: ISchema[],
  dblClickHandler: (schema: ISchema) => void,
) => {
  return (props: NodeProps<{ schema: ISchema }>) => {
    return (
      <div
        className="schema-node"
        key={`${props.id}-node`}
        onDoubleClick={() => dblClickHandler(props.data.schema)}
      >
        <div key="name" className="table-name">
          {props.data.schema.tableName}
        </div>

        <div key="title" className="table-title">
          <div className="inline-block">{props.data.schema.title}</div>
        </div>

        <table key="fields" className="fields mb-2 w-full">
          <tbody>
            {props.data.schema.fields.map((f, i) => (
              <tr key={i}>
                <td className="w-4/6 column relative">
                  {isRelationTarget(schemas, props.data.schema, f) ? (
                    <Handle
                      className="target-handle"
                      key={`${props.id}.rel-target.${f.reference}`}
                      type="target"
                      position={Position.Left}
                      id={`th-${f.reference}`}
                    />
                  ) : undefined}

                  {f.columnName}
                </td>
                <td className="w-1/6 text-center type">{f.type}</td>
                <td className="w-1/6 text-right icon relative">
                  {FieldTool.isPrimary(f) ? <Icon id="key" /> : undefined}
                  {f.tags.includes(FieldTag.CREATED) ? (
                    <Icon id="event_available" />
                  ) : undefined}
                  {f.tags.includes(FieldTag.UPDATED) ? (
                    <Icon id="edit_calendar" />
                  ) : undefined}
                  {f.tags.includes(FieldTag.TAGS) ? (
                    <Icon id="sell" />
                  ) : undefined}

                  {isRelationSource(props.data.schema, f) ? (
                    <Handle
                      className="source-handle"
                      key={`${props.id}.rel-source.${f.reference}`}
                      type="source"
                      position={Position.Right}
                      id={`sh-${f.reference}`}
                    />
                  ) : undefined}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
};
