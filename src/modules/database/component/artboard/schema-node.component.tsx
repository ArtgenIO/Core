import { Tooltip } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { FieldTag, ISchema } from '../../../schema';
import { isPrimary } from '../../../schema/util/field-tools';

export const createSchemaNode =
  (dblClickHandler: Dispatch<SetStateAction<unknown>>) =>
  (props: NodeProps<{ schema: ISchema }>) => {
    return (
      <div
        className="node-component"
        key={`${props.id}-node`}
        onDoubleClick={() => dblClickHandler(props.id)}
      >
        <Handle
          isConnectable
          className="relation-handle"
          key={`${props.id}.has-one`}
          type="target"
          position={Position.Right}
          id="has-one"
        />

        <Handle
          isConnectable
          className="relation-handle"
          key={`${props.id}.belongs-to-one`}
          type="source"
          position={Position.Left}
          id="belongs-to-one"
        />

        <div key="label" className="node-label">
          {props.data.schema.label ?? 'Missing Label'}
        </div>
        <div key="icon" className="text-center node-content relative">
          <img
            src={`/assets/icons/table.svg`}
            width="48"
            height="48"
            draggable={false}
          />
        </div>
        <div key="field" className="fields flex flex-wrap">
          {props.data.schema.fields.slice(0, 8).map(f => (
            <Tooltip key={`label-${f.reference}`} title={f.label}>
              <div className="schema-field">
                {isPrimary(f) ? (
                  <span key="primary" className="material-icons-outlined">
                    key
                  </span>
                ) : undefined}
                {f.tags.includes(FieldTag.CREATED) ? (
                  <span key="created" className="material-icons-outlined">
                    event_available
                  </span>
                ) : undefined}
                {f.tags.includes(FieldTag.UPDATED) ? (
                  <span key="updated" className="material-icons-outlined">
                    edit_calendar
                  </span>
                ) : undefined}
                {f.tags.includes(FieldTag.TAGS) ? (
                  <span key="tags" className="material-icons-outlined">
                    sell
                  </span>
                ) : undefined}
              </div>
            </Tooltip>
          ))}
        </div>

        <div key="relations" className="relations flex flex-wrap">
          {props.data.schema.relations.slice(0, 4).map(r => (
            <Tooltip key={`rel-tool-${r.name}`} title={`${r.kind} » ${r.name}`}>
              <div className={'schema-relation ' + r.kind}>
                <span className="material-icons-outlined">share</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };
