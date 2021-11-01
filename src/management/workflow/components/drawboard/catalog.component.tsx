import {
  MenuUnfoldOutlined,
  NodeExpandOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
import { Avatar, Divider, List, PageHeader } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import Search from 'antd/lib/input/Search';
import Sider from 'antd/lib/layout/Sider';
import startCase from 'lodash.startcase';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { pageNavCollapseAtom } from '../../../backoffice/backoffice.atoms';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import {
  catalogCollapsedAtom,
  elementsAtom,
  flowInstanceAtom,
  nodesAtom,
} from '../../atom/drawboard.atoms';
import { ElementFactory } from '../../factory/element.factory';

/**
 * Searches in the type and description of the node's meta
 */
const filterNodes = (search: string, nodes: ILambdaMeta[]): ILambdaMeta[] => {
  search = search.toString().trim().toLowerCase();

  // Empty search field
  if (!search) {
    return nodes;
  }

  return nodes.filter(
    node =>
      node.type.toLowerCase().match(search) ||
      node.description.toLowerCase().match(search),
  );
};

/**
 * Configure the draged element so it can be dropped on the board
 */
const onDragStart = (event, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

export default function DrawboardCatalogComponent() {
  const setMenuCollapse = useSetRecoilState(pageNavCollapseAtom);
  const [search, setSearch] = useState('');
  const nodes = useRecoilValue(nodesAtom);
  const [isCollapsed, setCollapsed] = useRecoilState(catalogCollapsedAtom);
  const [elements, setElements] = useRecoilState(elementsAtom);
  const [flowInstance, setFlowInstance] = useRecoilState(flowInstanceAtom);

  const addNode = (node: ILambdaMeta) => {
    const element = ElementFactory.fromNode(node);
    // TODO: find better position, like the further right center without collision, rightest + 70px top: (max.top max.bottom / 2)
    element.position = { x: 0, y: 0 };

    setElements(elements => elements.concat(element));
    setCollapsed(true);
    // Too fast, idk
    setTimeout(() => flowInstance.fitView(), 100);
  };

  useEffect(() => {
    // Save screen space by closing the side nav
    setMenuCollapse(true);
  }, []);

  return (
    <div>
      <Sider
        width="380px"
        collapsible
        reverseArrow={true}
        collapsedWidth="0px"
        trigger={null}
        collapsed={isCollapsed}
      >
        <ErrorBoundary>
          <PageHeader
            title={
              <span>
                <MenuUnfoldOutlined className="mr-2" /> Catalog
              </span>
            }
            ghost
          ></PageHeader>
          <div className="px-2">
            <Search
              onSearch={value => setSearch(value)}
              allowClear
              autoFocus={!isCollapsed}
            />
          </div>
          <Divider />
          <div style={{ width: '380px' }}>
            <List
              itemLayout="horizontal"
              size="small"
              dataSource={filterNodes(search, nodes)}
              renderItem={node => (
                <List.Item
                  key={node.type}
                  onDragStart={event => onDragStart(event, node.type)}
                  draggable
                  onTouchStart={event => onDragStart(event, node.type)}
                  actions={[
                    <a
                      className="text-green-400 text-xl"
                      onClick={() => addNode(node)}
                    >
                      <PlusSquareOutlined />
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      node.icon ? (
                        <Avatar
                          src={`/assets/icons/${node.icon}`}
                          style={{ backgroundColor: '#cfd2d9' }}
                          className="rounded-lg w-12 h-12 p-1"
                        />
                      ) : (
                        <NodeExpandOutlined
                          className="text-gray-800 text-5xl rounded-lg w-12 h-12"
                          style={{ backgroundColor: '#cfd2d9' }}
                        />
                      )
                    }
                    title={
                      <span className="text-white">{startCase(node.type)}</span>
                    }
                    description={node.description ?? 'MISSING DESCRIPTION!'}
                  />
                </List.Item>
              )}
            />
          </div>
        </ErrorBoundary>
      </Sider>
    </div>
  );
}
