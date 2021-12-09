import dagre from 'dagre/dist/dagre.js';
import { Elements, isNode, Position } from 'react-flow-renderer';

export const createLayouOrganizer = (
  nodeWidth: number = 300,
  nodeHeight: number = 220,
) => {
  const planner = new dagre.graphlib.Graph();
  planner.setDefaultEdgeLabel(() => ({}));

  return (elements: Elements, direction = 'LR'): Elements => {
    const isHorizontal = direction === 'LR';
    planner.setGraph({ rankdir: direction });

    elements.forEach(el => {
      if (isNode(el)) {
        planner.setNode(el.id, {
          width: nodeWidth,
          height: el.data.schema.fields.length * 26 + 40,
        });
      } else {
        planner.setEdge(el.source, el.target);
      }
    });

    dagre.layout(planner);

    return elements.map(el => {
      if (isNode(el)) {
        const nodeWithPosition = planner.node(el.id);
        el.targetPosition = isHorizontal ? Position.Left : Position.Top;
        el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // unfortunately we need this little hack to pass a slightly different position
        // to notify react flow about the change. Moreover we are shifting the dagre node position
        // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
        el.position = {
          x: nodeWithPosition.x + Math.random() / 1000,
          y: nodeWithPosition.y,
        };
      }

      return el;
    });
  };
};
