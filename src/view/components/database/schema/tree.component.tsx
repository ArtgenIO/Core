import { SearchOutlined } from '@ant-design/icons';
import { Divider, Empty, Input, Tree, TreeDataNode } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useRecoilValue } from 'recoil';
import { ISchema } from '../../../../models/schema.interface';
import { modulesAtom, schemasAtom } from '../../../atoms/admin.atoms';
import MenuBlock from '../../../layout/menu-block.component';

const applyQuickFilter = (filterValue: string) => (schema: ISchema) => {
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
  }

  return false;
};

type Props = {
  onSelect: (key: string | null) => void;
};

export default function SchemaTreeComponent({ onSelect }: Props) {
  const location = useLocation();

  const [quickFilter, setQuickFilter] = useState<string>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [tree, setTree] = useState<TreeDataNode[]>([]);
  const schemas = useRecoilValue(schemasAtom);
  const modules = useRecoilValue(modulesAtom);

  useEffect(() => {
    const segments = location.pathname.split('/').slice(3, 5);

    if (segments && segments.length === 2) {
      const newSelection = [`${segments[0]}$${segments[1]}`];

      if (!selected.length || selected[0] != newSelection[0]) {
        setSelected(newSelection);
      }
    }

    setQuickFilter(null);
  }, [location]);

  useEffect(() => {
    onSelect(selected.length ? selected[0] : null);
  }, [selected]);

  useEffect(() => {
    if (schemas) {
      const tree: TreeDataNode[] = [];

      // Build the module branches
      for (const module of modules) {
        const children = schemas
          .filter(s => s.moduleId == module.id)
          .filter(applyQuickFilter(quickFilter))
          .sort((a, b) => (a.title > b.title ? 1 : -1))
          .map(s => ({
            key: `${s.database}$${s.reference}`,
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
        .filter(s => !s.moduleId)
        .filter(applyQuickFilter(quickFilter))) {
        tree.push({
          title: schema.title,
          key: `${schema.database}$${schema.reference}`,
          isLeaf: true,
        });
      }

      setTree(tree);
    }
  }, [schemas, quickFilter]);

  return (
    <>
      <MenuBlock title="Content Explorer" className="-mb-1 test--content-tree">
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
            selectedKeys={selected}
            onSelect={(selection: string[]) =>
              setSelected(selection as string[])
            }
          />
        ) : (
          <Empty className="m-2" description="No Match" />
        )}
      </MenuBlock>
    </>
  );
}
