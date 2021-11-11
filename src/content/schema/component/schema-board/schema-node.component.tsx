import React from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';

export const SchemaNode = (props: NodeProps) => {
  return (
    <div className="node-component">
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
        key={`${props.id}.has-many`}
        type="target"
        position={Position.Bottom}
        id="has-many"
      />
      <Handle
        isConnectable
        className="relation-handle"
        key={`${props.id}.belongs-to-one`}
        type="source"
        position={Position.Left}
        id="belongs-to-one"
      />
      <Handle
        isConnectable
        className="relation-handle"
        key={`${props.id}.belongs-to-many`}
        type="source"
        position={Position.Top}
        id="belongs-to-many"
      />
      <div className="node-label">{props.data?.label ?? 'Missing Label'}</div>
      <div className="text-center node-content relative">
        <img
          src={`/assets/icons/table.svg`}
          width="48"
          height="48"
          draggable={false}
        />
      </div>
    </div>
  );
};
