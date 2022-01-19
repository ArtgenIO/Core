import { DatabaseOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Tree, TreeDataNode } from 'antd';
import { useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';
import { databasesAtom, schemasAtom } from '../../../admin/admin.atoms';
import MenuBlock from '../../../admin/component/menu-block.component';

export default function DatabaseExplorerComponent() {
  const [tree, setTree] = useState<TreeDataNode[]>([]);
  const [selected, setSelected] = useState([]);

  // Routing
  const navigate = useNavigate();

  // Global states
  const databases = useRecoilValue(databasesAtom);
  const schemas = useRecoilValue(schemasAtom);

  useEffect(() => {
    if (databases) {
      setTree(
        databases.map(db => ({
          title: db.title,
          key: db.ref,
          children: schemas
            .filter(s => s.database === db.ref)
            .map(s => ({
              title: s.title,
              key: `${db.ref}-${s.reference}`,
              isLeaf: true,
            })) as TreeDataNode[],
          className: 'test--db-list-ref',
          icon: <DatabaseOutlined />,
          isLeaf: false,
          selectable: true,
        })),
      );
    }
  }, [schemas, databases]);

  return (
    <MenuBlock
      title="Database Explorer"
      className="-mb-1"
      style={{ borderTop: 0 }}
    >
      <div className="px-2 py-2">
        <Input
          placeholder="Schemantic Search..."
          prefix={<SearchOutlined />}
          size="small"
        />
      </div>
      <Divider className="my-0" />

      {tree.length ? (
        <Tree.DirectoryTree
          treeData={tree}
          defaultExpandAll
          selectedKeys={selected}
          onSelect={selected => {
            if (selected.length) {
              const [ref, sch] = selected[0].toString().split('-');
              const path = generatePath(
                `/admin/database/artboard/:ref?schema=${sch}`,
                {
                  ref,
                },
              );

              navigate(path);
            }

            setSelected(selected);
          }}
        />
      ) : undefined}
    </MenuBlock>
  );
}
