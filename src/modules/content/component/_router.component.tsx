import { SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Layout, Result, Tree, TreeDataNode } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { QueryBuilder } from 'odata-query-builder';
import React, { useEffect, useState } from 'react';
import { generatePath, Route, Routes, useNavigate } from 'react-router';
import MenuBlock from '../../admin/component/menu-block.component';
import { useHttpClient } from '../../admin/library/use-http-client';
import { ISchema } from '../../schema';
import { IContentModule } from '../interface/content-module.interface';
import ContentListComponent from './list.component';
import PlaceholderComponent from './placeholder.component';

type SchemaWithModule = ISchema & {
  module?: IContentModule;
};

export default function ContentRouterComponent() {
  const navigate = useNavigate();
  const [tree, setTree] = useState<TreeDataNode[]>([]);

  const [{ data: schemas, loading, error }] = useHttpClient<SchemaWithModule[]>(
    '/api/odata/main/schema' +
      new QueryBuilder().top(5000).select('*,module').toQuery(),
    {
      useCache: false,
    },
  );

  useEffect(() => {
    if (schemas) {
      const modules: IContentModule[] = [];
      const tree: TreeDataNode[] = [];

      for (const schema of schemas
        .filter(s => s.module)
        .sort((a, b) => (a.title > b.title ? 1 : -1))) {
        if (!modules.find(m => schema.module.id === m.id)) {
          modules.push(schema.module);
        }
      }

      for (const module of modules) {
        tree.push({
          title: module.name,
          key: `m-${module.id}`,
          selectable: false,
          children: schemas
            .filter(s => s.module)
            .filter(s => s.module.id == module.id)
            .sort((a, b) => (a.title > b.title ? 1 : -1))
            .map(s => ({
              key: `s-${s.database}-${s.reference}`,
              title: s.title,
              isLeaf: true,
            })),
          isLeaf: false,
        });
      }

      for (const schema of schemas.filter(s => !s.module)) {
        tree.push({
          title: schema.title,
          key: `s-${schema.database}-${schema.reference}`,
          isLeaf: true,
        });
      }

      setTree(tree);
    }
  }, [loading]);

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
              placeholder="Content Search..."
              prefix={<SearchOutlined />}
              size="small"
            />
          </div>
          <Divider className="my-0" />

          {tree.length ? (
            <Tree.DirectoryTree
              treeData={tree}
              defaultExpandAll
              onSelect={selected => {
                if (selected.length) {
                  const [prefix, db, ref] = selected[0].toString().split('-');

                  if (prefix == 's') {
                    const path = generatePath('/admin/content/:db/:ref/list', {
                      db,
                      ref,
                    });

                    navigate(path);
                  }
                }
              }}
            />
          ) : undefined}
        </MenuBlock>
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
