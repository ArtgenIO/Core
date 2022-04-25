import cloneDeep from 'lodash.clonedeep';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  isEdge,
  isNode,
  useReactFlow,
} from 'react-flow-renderer';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { schemasAtom } from '../../../admin/admin.atoms';
import { Elements } from '../../../flow/interface/elements.interface';
import { ISchema } from '../../../schema';
import SchemaEditorComponent from '../../../schema/component/editor.component';
import { SchemaSerializer } from '../../../schema/serializer/schema.serializer';
import { fSchema } from '../../../schema/util/filter-schema';
import { createEmptySchema } from '../../../schema/util/get-new-schema';
import { createLayouOrganizer } from '../../../schema/util/layout-organizer';
import DatabaseNameComponent from './name.component';
import { createSchemaNode } from './schema-node.component';
import './schemaboard.component.less';
import DatabaseToolsComponent from './tools.component';

export default function DatabaseArtboardComponent() {
  // Router
  const { ref } = useParams();
  const [schemas, setSchemas] = useRecoilState(schemasAtom);
  const [search, setSearch] = useSearchParams();

  // Artboard state
  const flowWrapper = useRef(null);
  const flowInstance = useReactFlow<{ schema: ISchema }>();
  const [elements, setElements] = useState<Elements>([]);
  const [showEditor, setShowEditor] = useState<ISchema>(null);
  const [selectedNode, setSelectedNode] = useState<ISchema>(null);

  const layoutOrganizer = createLayouOrganizer(
    300,
    el => el.data.schema.fields.length * 26 + 40,
  );

  useEffect(() => {
    if (search.has('schema')) {
      const schema = schemas.find(
        s => s.database === ref && s.reference === search.get('schema'),
      );

      if (!showEditor) {
        setShowEditor(schema);
      }
    }
  }, [search]);

  const zoomTo = (target: ISchema) => {
    if (flowInstance) {
      const el = flowInstance
        .getNodes()
        .find(e => e.data.schema.reference == target.reference);

      if (el) {
        flowInstance.setCenter(el.position.x + 400, el.position.y + 200, {
          duration: 1000,
          zoom: 1.5,
        });
      }
    }
  };

  useEffect(() => {
    if (selectedNode) {
      if (!flowInstance || selectedNode.reference === '__new_schema') {
        zoomTo(selectedNode);
      }
    }
  }, [selectedNode]);

  useEffect(() => {
    if (showEditor) {
      search.set('schema', showEditor.reference);
      setSelectedNode(showEditor);

      zoomTo(showEditor);
      setSearch(search);
    } else {
      //search.delete('schema');
    }
  }, [showEditor]);

  useEffect(() => {
    if (schemas) {
      setElements(() =>
        layoutOrganizer(
          SchemaSerializer.toElements(schemas.filter(s => s.database === ref)),
        ),
      );
    }
  }, [schemas, ref]);

  const doNew = () => {
    setShowEditor(createEmptySchema(ref));
  };

  const doRemove = (schema: ISchema) => {
    setSchemas(currentState => {
      const newState = cloneDeep(currentState);
      newState.splice(newState.findIndex(fSchema(schema)), 1);

      return newState;
    });

    setSelectedNode(null);
  };

  const nodeTypesMemo = useMemo(
    () => ({
      schema: createSchemaNode(schemas, s => setShowEditor(s)),
    }),
    [],
  );

  return (
    <>
      <div className="h-screen bg-midnight-800">
        <div className="w-full h-full" ref={flowWrapper}>
          <ReactFlow
            defaultNodes={elements.filter(isNode)}
            defaultEdges={elements.filter(isEdge)}
            nodeTypes={nodeTypesMemo as any}
            defaultZoom={1.2}
            onSelectionChange={selections => {
              if (selections?.nodes?.length) {
                if (isNode(selections[0])) {
                  setSelectedNode(selections[0].data.schema);
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
            {showEditor ? (
              <SchemaEditorComponent
                schema={showEditor}
                doRemove={doRemove}
                onClose={newSchema => {
                  if (newSchema) {
                    setSchemas(currentState => {
                      const newState = cloneDeep(currentState);
                      const idx = newState.findIndex(fSchema(newSchema));

                      // Replace with the newSchema state
                      if (idx !== -1) {
                        newState.splice(idx, 1, newSchema);
                      }
                      // Add new schema
                      else {
                        newState.push(newSchema);
                      }

                      return newState;
                    });
                  }

                  setShowEditor(null);
                }}
              />
            ) : undefined}

            <DatabaseToolsComponent
              doNew={doNew}
              selectedNode={selectedNode}
              doRemove={doRemove}
              setOpenedNode={setShowEditor}
              setElements={setElements}
              layoutOrganizer={layoutOrganizer}
            />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}
