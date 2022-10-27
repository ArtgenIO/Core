import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { getMarkerEnd, getSmoothStepPath } from 'reactflow';

type Props = {
  onClick: (id: string) => void;
};

export const SmartEdgeFactory =
  ({ onClick }: Props) =>
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    arrowHeadType,
    markerEndId,
  }) => {
    const [edgePath, edgeCenterX, edgeCenterY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    const classes = [
      'smart-edge',
      'react-flow__edge',
      'react-flow__edge-smoothstep',
      'animated',
    ];

    return (
      <g
        className={classes.join(' ')}
        style={{ pointerEvents: 'all' }}
        onClick={() => onClick(id)}
      >
        <path
          id={id}
          style={style}
          className="react-flow__edge-path animated"
          d={edgePath}
          markerEnd={markerEnd}
        />
        <foreignObject
          width="32"
          height="32"
          x={edgeCenterX - 24 / 2}
          y={edgeCenterY - 24 / 2}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <Button
            type="primary"
            shape="circle"
            size="small"
            className={`artboard-edit-button ${
              data?.transform ? 'has-transform' : ''
            }`}
            icon={<SettingOutlined className="opacity-80 hover:opacity-100" />}
          />
        </foreignObject>
      </g>
    );
  };
