import dagre from 'dagre/dist/dagre.js';
import { Elements, isNode, Position } from 'react-flow-renderer';

export const createLayouOrganizer = (
  nodeWidth: number = 120,
  nodeHeight: number = 164,
) => {
  const planner = new dagre.graphlib.Graph();
  planner.setDefaultEdgeLabel(() => ({}));

  return (elements: Elements, direction = 'RL'): Elements => {
    const isHorizontal = direction === 'RL';
    planner.setGraph({ rankdir: direction });

    elements.forEach(el => {
      if (isNode(el)) {
        planner.setNode(el.id, { width: nodeWidth, height: nodeHeight });
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
          x: 200 + nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
          y: 60 + nodeWithPosition.y - nodeHeight / 2,
        };
      }

      return el;
    });
  };
};
