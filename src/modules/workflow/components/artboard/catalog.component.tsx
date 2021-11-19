import { MenuUnfoldOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { Avatar, Divider, List, PageHeader } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import Search from 'antd/lib/input/Search';
import Sider from 'antd/lib/layout/Sider';
import startCase from 'lodash.startcase';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { pageNavCollapseAtom } from '../../../admin/admin.atoms';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import {
  catalogCollapsedAtom,
  elementsAtom,
  flowInstanceAtom,
  lambdaMetasAtom,
} from '../../atom/artboard.atoms';
import { createNode } from '../../util/create-node';

/**
 * Searches in the type and description of the node's meta
 */
const filterLambdas = (
  search: string,
  lambdas: ILambdaMeta[],
): ILambdaMeta[] => {
  search = search.toString().trim().toLowerCase();

  // Empty search field
  if (!search) {
    return lambdas;
  }

  return lambdas.filter(
    lambda =>
      lambda.type.toLowerCase().match(search) ||
      lambda.description.toLowerCase().match(search),
  );
};

/**
 * Configure the draged element so it can be dropped on the board
 */
const onDragStart = (event, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

export default function ArtboardCatalogComponent() {
  const setMenuCollapse = useSetRecoilState(pageNavCollapseAtom);
  const lambdaMetas = useRecoilValue(lambdaMetasAtom);
  const setElements = useSetRecoilState(elementsAtom);
  const flowInstance = useRecoilValue(flowInstanceAtom);
  const [isCollapsed, setCollapsed] = useRecoilState(catalogCollapsedAtom);
  const [search, setSearch] = useState('');

  // Called when the user adds a new node with the + button
  const addNode = (node: ILambdaMeta) => {
    const element = createNode(node, flowInstance.getElements());
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
              dataSource={filterLambdas(search, lambdaMetas)}
              renderItem={lambda => (
                <List.Item
                  key={lambda.type}
                  onDragStart={event => onDragStart(event, lambda.type)}
                  draggable
                  onTouchStart={event => onDragStart(event, lambda.type)}
                  actions={[
                    <a
                      className="text-green-400 text-xl"
                      onClick={() => addNode(lambda)}
                    >
                      <PlusSquareOutlined />
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={`/assets/icons/${lambda.icon ?? 'lambda.png'}`}
                        style={{ backgroundColor: '#cfd2d9' }}
                        className="rounded-lg w-12 h-12 p-1"
                      />
                    }
                    title={
                      <span className="text-white">
                        {startCase(lambda.type)}
                      </span>
                    }
                    description={
                      lambda.description ?? 'Does not have a description?!'
                    }
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
