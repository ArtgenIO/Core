import { message, notification } from 'antd';
import { diff } from 'just-diff';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Elements,
  isNode,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { useParams } from 'react-router-dom';
import { useHttpClientSimple } from '../../../admin/library/http-client';
import { toRestRoute } from '../../../content/util/schema-url';
import { ISchema } from '../../../schema';
import { SchemaSerializer } from '../../../schema/serializer/schema.serializer';
import { createEmptySchema } from '../../../schema/util/get-new-schema';
import { createLayouOrganizer } from '../../../schema/util/layout-organizer';
import DatabaseNameComponent from './name.component';
import DatabaseSchemaEditorComponent from './schema-editor.component';
import { createSchemaNode } from './schema-node.component';
import './schemaboard.component.less';
import DatabaseToolsComponent from './tools.component';

export default function DatabaseArtboardComponent() {
  // Router
  const httpClient = useHttpClientSimple();
  const { ref } = useParams();
  const apiReadUrl =
    toRestRoute({
      database: 'main',
      reference: 'Schema',
    }) +
    new QueryBuilder()
      .top(1000)
      .filter(f => f.filterExpression('database', 'eq', ref))
      .toQuery();

  // Artboard state
  const flowWrapper = useRef(null);
  const [flowInstance, setFlowInstance] = useState<OnLoadParams>(null);
  const [elements, setElements] = useState<Elements>([]);
  const [openedNode, setOpenedNode] = useState<string>(null);
  const [selectedNode, setSelectedNode] = useState<string>(null);
  const [savedState, setSavedState] = useState<ISchema[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const layoutOrganizer = createLayouOrganizer();

  useEffect(() => {
    (async () => {
      const response = await httpClient.get<ISchema[]>(apiReadUrl);

      setElements(() =>
        layoutOrganizer(SchemaSerializer.toElements(response.data)),
      );
      setSavedState(response.data);
      setIsLoading(false);
    })();
  }, [ref]);

  const doSave = async () => {
    const currentState = SchemaSerializer.fromElements(
      flowInstance.getElements(),
    );

    for (const schema of currentState) {
      const original = savedState.find(s => s.reference === schema.reference);

      // New schema create now
      if (!original) {
        await httpClient
          .post('/api/rest/main/schema', schema)
          .then(() => {
            message.success(`Schema [${schema.reference}] created!`);
          })
          .catch(e => {
            message.error(`Schema [${schema.reference}] creating error!`);
          });
      }
      // Already had
      else {
        const changes = diff(original, schema);

        if (!changes || !changes.length) {
          //message.info(`Schema [${schema.reference}] is unchanged`);
        } else {
          await httpClient
            .patch(
              `/api/rest/main/schema/${schema.database}/${schema.reference}`,
              schema,
            )
            .then(() => {
              message.success(`Schema [${schema.reference}] updated!`);
            })
            .catch(e => {
              message.error(`Schema [${schema.reference}] update error!`);
            });
        }
      }
    }

    // Find deleted ones.
    const deletedRefs = savedState.filter(
      o => !currentState.some(c => c.reference === o.reference),
    );

    for (const deleted of deletedRefs) {
      await httpClient
        .delete(
          toRestRoute({
            database: 'main',
            reference: 'Schema',
          }) + `${ref}/${deleted.reference}`,
        )
        .then(() => {
          // message.success(`Schema [${deleted.reference}] deleted!`);
        })
        .catch(e => {
          message.error(`Schema [${deleted.reference}] delete error!`);
        });
    }

    setSavedState(currentState);
    notification.success({
      message: 'Changes has been saved!',
      placement: 'bottomRight',
    });
  };

  const doNew = () => {
    const currentState = SchemaSerializer.fromElements(
      flowInstance.getElements(),
    );

    const newSchema = createEmptySchema(ref);

    currentState.push(newSchema);

    setElements(SchemaSerializer.toElements(currentState));
    flowInstance.fitView();

    setOpenedNode(newSchema.reference);
  };

  const doRemove = () => {
    setElements(els => els.filter(el => el.id !== selectedNode));
    setSelectedNode(null);
  };

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  return (
    <>
      <div className="h-screen bg-midnight-800">
        <ReactFlowProvider>
          <div className="w-full h-full" ref={flowWrapper}>
            <ReactFlow
              elements={elements}
              onLoad={(instance: OnLoadParams) => setFlowInstance(instance)}
              nodeTypes={{
                schema: createSchemaNode(savedState, setOpenedNode),
              }}
              defaultZoom={1.2}
              onSelectionChange={selections => {
                if (selections?.length) {
                  if (isNode(selections[0])) {
                    setSelectedNode(selections[0].id);
                  }
                } else {
                  setSelectedNode(null);
                }
              }}
            >
              <Background
                variant={BackgroundVariant.Lines}
                gap={24}
                size={0.5}
                color="#37393f"
              />
              <DatabaseNameComponent name={ref} />
              <DatabaseSchemaEditorComponent
                flowInstance={flowInstance}
                openedNode={openedNode}
                setOpenedNode={setOpenedNode}
                setElements={setElements}
              />
              <DatabaseToolsComponent
                doNew={doNew}
                selectedNode={selectedNode}
                doSave={doSave}
                doRemove={doRemove}
                setOpenedNode={setOpenedNode}
                flowInstance={flowInstance}
                setElements={setElements}
                layoutOrganizer={layoutOrganizer}
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </>
  );
}
