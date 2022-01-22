import { kebabCase } from 'lodash';
import { ReactNode } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { ILambdaMeta } from '../../lambda/interface/meta.interface';

export class NodeFactory {
  /**
   * Convert node meta into a react flow component
   */
  static fromMeta(
    node: ILambdaMeta,
    doOpenNodeConfig: (elementId: string) => void,
  ): ReactNode {
    return (props: NodeProps) => {
      const handles = [];
      const totalInputs = node.handles.filter(
        h => h.direction === 'input',
      ).length;
      const totalOutputs = node.handles.filter(
        h => h.direction === 'output',
      ).length;
      let nthInput = 0;
      let nthOutput = 0;

      for (const handle of node.handles) {
        const hKey = [node.type, handle.direction, handle.id].join('.');
        const hType = handle.direction == 'input' ? 'target' : 'source';
        const hPos =
          handle.direction == 'input' ? Position.Left : Position.Right;
        const classes = [`handle-${kebabCase(handle.id)}`, 'handle-custom'];

        if (handle.direction === 'input' && totalInputs > 1) {
          classes.push('handle-set-' + totalInputs);
          classes.push('handle-set-nth-' + ++nthInput);
        }

        if (handle.direction === 'output' && totalOutputs > 1) {
          classes.push('handle-set-' + totalOutputs);
          classes.push('handle-set-nth-' + ++nthOutput);
        }

        // onConnect validator here

        handles.push(
          <Handle
            className={classes.join(' ')}
            key={hKey}
            type={hType}
            position={hPos}
            isConnectable
            id={handle.id}
          />,
        );
      }

      return (
        <div
          className="node-component"
          onDoubleClick={() => doOpenNodeConfig(props.id)}
        >
          {handles}
          <div className="node-label">{props.data.title}</div>
          <div className="text-center node-content relative">
            <img
              src={`/assets/icons/${node.icon ?? 'lambda.png'}`}
              width="48"
              height="48"
              draggable={false}
            />
          </div>
        </div>
      );
    };
  }
}
