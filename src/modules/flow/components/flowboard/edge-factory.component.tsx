import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import {
  getEdgeCenter,
  getMarkerEnd,
  getSmoothStepPath,
} from 'react-flow-renderer';

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
    const edgePath = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    return (
      <>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
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
            onClick={() => onClick(id)}
            type="primary"
            shape="circle"
            size="small"
            className={`artboard-edit-button ${
              data?.transform ? 'has-transform' : ''
            }`}
            icon={<SettingOutlined className="opacity-80 hover:opacity-100" />}
          />
        </foreignObject>
      </>
    );
  };
