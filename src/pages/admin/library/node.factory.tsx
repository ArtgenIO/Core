import { Avatar } from 'antd';
import kebabCase from 'lodash.kebabcase';
import { Handle, NodeProps, Position } from 'reactflow';
import { ILambdaMeta } from '../../../api/types/meta.interface';
import { INode } from '../../../api/types/node.interface';

export class NodeFactory {
  /**
   * Convert node meta into a react flow component
   */
  static fromMeta(
    lambda: ILambdaMeta,
    onDoubleClick: (elementId: string) => void,
  ) {
    const totalInputs = lambda.handles.filter(
      h => h.direction === 'input',
    ).length;
    const totalOutputs = lambda.handles.filter(
      h => h.direction === 'output',
    ).length;

    return (nodeProps: NodeProps<INode>) => {
      const handles = [];

      let nthInput = 0;
      let nthOutput = 0;

      for (const handle of lambda.handles) {
        const hKey = [lambda.type, handle.direction, handle.id].join('.');
        const hType = handle.direction == 'input' ? 'target' : 'source';
        const hPos =
          handle.direction == 'input' ? Position.Top : Position.Bottom;
        const classes = [`handle-${kebabCase(handle.id)}`, 'handle-custom'];

        if (handle.direction === 'input' && totalInputs > 1) {
          classes.push('handle-set-' + totalInputs);
          classes.push('handle-set-nth-' + ++nthInput);
        }

        if (handle.direction === 'output' && totalOutputs > 1) {
          classes.push('handle-set-' + totalOutputs);
          classes.push('handle-set-nth-' + ++nthOutput);
        }

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

      const classes = ['flow-node'];

      if (lambda.type.match('trigger')) {
        classes.push('trigger');
      } else if (lambda.type.match('terminate')) {
        classes.push('terminate');
      } else if (lambda.type === 'log') {
        classes.push('log');
      }

      return (
        <div
          className={classes.join(' ')}
          onDoubleClick={() => onDoubleClick(nodeProps.id)}
        >
          {handles}
          <div className="node-label">
            {nodeProps.data.type.replace(/\./g, ' / ')}
          </div>
          <div className="node-content">
            <div className="flex">
              <div className="shrink">
                <Avatar
                  src={`/admin/public/icons/${lambda.icon ?? 'lambda.png'}`}
                  draggable={false}
                  size={34}
                  shape="square"
                  className="logo"
                />
              </div>
              <div className="grow title">{nodeProps.data.title}</div>
            </div>
          </div>
        </div>
      );
    };
  }
}
