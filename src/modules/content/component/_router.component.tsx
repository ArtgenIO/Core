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
import React, { useEffect, useState } from 'react';
import {
  generatePath,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router';
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { IContentModule } from '../interface/content-module.interface';
import ContentListComponent from './list.component';
import PlaceholderComponent from './placeholder.component';

type SchemaWithModule = ISchema & {
  module?: IContentModule;
};

const applyQuickFilter =
  (filterValue: string) => (schema: SchemaWithModule) => {
    if (!filterValue) {
      return true;
    }

    filterValue = filterValue.toLowerCase();
    const words = filterValue.replace(/\s+/, ' ').split(' ');

    for (const word of words) {
      // Match in the title
      if (schema.title.toLowerCase().match(word)) {
        return true;
      }

      // In the matched module
      if (schema.moduleId) {
        if (schema.module.name.toLowerCase().match(word)) {
          return true;
        }
      }
    }

    return false;
  };

export default function ContentRouterComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [quickFilter, setQuickFilter] = useState<string>(null);
  const [selected, setSelected] = useState<string[]>(null);
  const [tree, setTree] = useState<TreeDataNode[]>([]);

  const [{ data: schemas, loading, error }] = useHttpClient<SchemaWithModule[]>(
    '/api/rest/main/schema' +
      new QueryBuilder().top(1_000).select('*,module').toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    const segments = location.pathname.split('/').slice(3, 5);

    if (segments && segments.length === 2) {
      setSelected([`${segments[0]}-${segments[1]}`]);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (schemas) {
      const modules: IContentModule[] = [];
      const tree: TreeDataNode[] = [];

      // Collect modules from existing references
      for (const schema of schemas
        .filter(s => s.module)
        .sort((a, b) => (a.title > b.title ? 1 : -1))) {
        if (!modules.find(m => schema.module.id === m.id)) {
          modules.push(schema.module);
        }
      }

      // Build the module branches
      for (const module of modules) {
        const children = schemas
          .filter(s => s.module)
          .filter(s => s.module.id == module.id)
          .filter(applyQuickFilter(quickFilter))
          .sort((a, b) => (a.title > b.title ? 1 : -1))
          .map(s => ({
            key: `${s.database}-${s.reference}`,
            title: s.title,
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

      // Add the schemas which are not in any module
      for (const schema of schemas
        .filter(s => !s.module)
        .filter(applyQuickFilter(quickFilter))) {
        tree.push({
          title: schema.title,
          key: `${schema.database}-${schema.reference}`,
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
        title="Oups! There was an error, while we loaded the schemas"
      ></Result>
    );
  }

  return (
    <Layout hasSider>
      <Sider width={220} className="h-screen depth-2 overflow-auto gray-scroll">
        <MenuBlock
          title="Content Explorer"
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
                  const [db, ref] = selected[0].toString().split('-');

                  const path = generatePath('/admin/content/:db/:ref/list', {
                    db,
                    ref,
                  });

                  navigate(path);
                }
              }}
            />
          ) : (
            <Empty className="m-2" description="No Match" />
          )}
        </MenuBlock>
        <MenuBlock title="Content Transactions"></MenuBlock>
      </Sider>

      <Layout>
        <Routes>
          <Route
            path=":database/:reference/list"
            element={<ContentListComponent />}
          ></Route>
          <Route path="/" element={<PlaceholderComponent />}></Route>
        </Routes>
      </Layout>
    </Layout>
  );
}
