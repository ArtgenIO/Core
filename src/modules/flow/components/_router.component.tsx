import { SearchOutlined } from '@ant-design/icons';
import {
  Divider,
  Empty,
  Input,
  Layout,
  Result,
  Tree,
  TreeDataNode,
} from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import React, { lazy, useEffect, useState } from 'react';
import {
  generatePath,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router';
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { IContentModule } from '../../content/interface/content-module.interface';
import { toRestSysRoute } from '../../content/util/schema-url';
import { IFindResponse } from '../../rest/interface/find-reponse.interface';
import { IFlow } from '../interface';
import CreateFlowComponent from './create.component';
import FlowListComponent from './list.component';
import ManagerMenuComponent from './_menu/manager.component';

type FlowWithModule = IFlow & {
  module?: IContentModule;
};

const applyQuickFilter = (filterValue: string) => (flow: FlowWithModule) => {
  if (!filterValue) {
    return true;
  }

  filterValue = filterValue.toLowerCase();
  const words = filterValue.replace(/\s+/, ' ').split(' ');

  for (const word of words) {
    // Match in the title
    if (flow.name.toLowerCase().match(word)) {
      return true;
    }

    // In the matched module
    if (flow.moduleId) {
      if (flow.module.name.toLowerCase().match(word)) {
        return true;
      }
    }
  }

  return false;
};

export default function FlowRouterComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [quickFilter, setQuickFilter] = useState<string>(null);
  const [selected, setSelected] = useState<string[]>(null);
  const [tree, setTree] = useState<TreeDataNode[]>([]);

  const [showCreate, setShowCreate] = useState<boolean>(false);

  const [{ data: flows, loading, error }, refetch] = useHttpClient<
    IFindResponse<FlowWithModule>
  >(
    toRestSysRoute('flow') +
      new QueryBuilder().top(1_000).select('*,module').toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    const segments = location.pathname.split('/').slice(4, 5);

    if (segments && segments.length === 1) {
      setSelected([segments[0]]);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (flows) {
      const modules: IContentModule[] = [];
      const tree: TreeDataNode[] = [];

      // Collect modules from existing references
      for (const flow of flows.data
        .filter(f => f.module)
        .sort((a, b) => (a.name > b.name ? 1 : -1))) {
        if (!modules.find(m => flow.module.id === m.id)) {
          modules.push(flow.module);
        }
      }

      // Build the module branches
      for (const module of modules) {
        const children = flows.data
          .filter(f => f.module)
          .filter(f => f.module.id == module.id)
          .filter(applyQuickFilter(quickFilter))
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .map(f => ({
            key: f.id,
            title: f.name,
            isLeaf: true,
          }));

        // Filtered
        if (!children.length) {
          continue;
        }

        tree.push({
          title: module.name,
          key: module.id,
          selectable: false,
          children,
          isLeaf: false,
        });
      }

      // Add the flows which are not in any module
      for (const flow of flows.data
        .filter(s => !s.module)
        .filter(applyQuickFilter(quickFilter))) {
        tree.push({
          title: flow.name,
          key: flow.id,
          isLeaf: true,
        });
      }

      setTree(tree);
    }
  }, [loading, quickFilter]);

  // Clear the quick filter when the location changes
  // I assume the user clicked to the match
  useEffect(() => setQuickFilter(null), [location.pathname]);

  if (error) {
    return (
      <Result
        status="error"
        title="Oups! There was an error, while we loaded the flows"
      ></Result>
    );
  }

  const Artboard = lazy(() => import('./artboard.component'));

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock
          title="Flow Explorer"
          className="-mb-1"
          style={{ borderTop: 0 }}
        >
          <div className="px-2 py-2">
            <Input
              placeholder="Quick Filter"
              prefix={<SearchOutlined />}
              value={quickFilter}
              onChange={e => {
                setQuickFilter(e.target?.value ?? null);
              }}
              size="small"
              allowClear
            />
          </div>
          <Divider className="my-0" />

          {tree.length ? (
            <Tree.DirectoryTree
              treeData={tree}
              defaultExpandAll
              defaultSelectedKeys={selected}
              onSelect={selected => {
                if (selected.length) {
                  const path = generatePath('/admin/flow/artboard/:flowId', {
                    flowId: selected[0].toString(),
                  });

                  navigate(path);
                }
              }}
            />
          ) : (
            <Empty className="m-2" description="No Match" />
          )}
        </MenuBlock>

        <ManagerMenuComponent />
      </Sider>

      <Layout>
        <Routes>
          <Route path="artboard/:id" element={<Artboard />}></Route>
          <Route path="list" element={<FlowListComponent />}></Route>
          <Route
            path="/"
            element={<Navigate to={`/admin/flow/list`} />}
          ></Route>
        </Routes>
      </Layout>

      {showCreate ? (
        <CreateFlowComponent
          onClose={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      ) : undefined}
    </Layout>
  );
}
