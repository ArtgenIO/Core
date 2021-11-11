import dagre from 'dagre';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Elements,
  isNode,
  NodeTypesType,
  OnLoadParams,
  Position,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { useParams } from 'react-router';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { ISchema } from '../..';
import { pageDrawerAtom } from '../../../../management/backoffice/backoffice.atoms';
import { useHttpClientOld } from '../../../../management/backoffice/library/http-client';
import { routeCrudAPI } from '../../../crud/util/schema-url';
import { schemasToElements } from '../../util/schemas-to-elements';
import DatabaseNameComponent from './database-name.component';
import './schema-board.component.less';
import { SchemaNode } from './schema-node.component';

export default function SchemaBoardComponent() {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 100;
  const nodeHeight = 100;

  const getLayoutedElements = (elements: Elements, direction = 'RL') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    elements.forEach(el => {
      if (isNode(el)) {
        dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
      } else {
        dagreGraph.setEdge(el.source, el.target);
      }
    });

    dagre.layout(dagreGraph);

    return elements.map(el => {
      if (isNode(el)) {
        const nodeWithPosition = dagreGraph.node(el.id);
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

  // Page state
  const setPageDrawer = useSetRecoilState(pageDrawerAtom);
  const resetPageDrawerState = useResetRecoilState(pageDrawerAtom);
  // Router
  const httpClient = useHttpClientOld();
  const databaseName = useParams<{ database: string }>().database;
  const apiReadUrl =
    routeCrudAPI({
      database: 'system',
      reference: 'Schema',
    }) +
    new QueryBuilder()
      .top(1000)
      .filter(f => f.filterExpression('database', 'eq', databaseName))
      .toQuery();

  const flowWrapper = useRef(null);
  const schemaNodeTypes: NodeTypesType = {
    schema: SchemaNode,
  };
  const [flowInstance, setFlowInstance] = useState<OnLoadParams>(null);
  const [elements, setElements] = useState<Elements>([]);

  useEffect(() => {
    (async () => {
      const response = await httpClient.get<ISchema[]>(apiReadUrl);

      setElements(() => getLayoutedElements(schemasToElements(response.data)));

      if (flowInstance) {
        flowInstance.fitView({
          padding: 50,
        });
      }
    })();

    return () => {
      resetPageDrawerState();
    };
  }, [databaseName]);

  return (
    <>
      <div className="h-screen bg-dark">
        <ReactFlowProvider>
          <div className="w-full h-full" ref={flowWrapper}>
            <ReactFlow
              elements={elements}
              onLoad={(instance: OnLoadParams) => setFlowInstance(instance)}
              nodeTypes={schemaNodeTypes}
              defaultZoom={1.5}
            >
              <Background
                variant={BackgroundVariant.Lines}
                gap={24}
                size={0.5}
                color="#37393f"
              />
              <DatabaseNameComponent name={databaseName} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </>
  );
}
