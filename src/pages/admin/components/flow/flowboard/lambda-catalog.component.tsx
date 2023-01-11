import { PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, Input, List } from 'antd';
import startCase from 'lodash.startcase';
import { Dispatch, SetStateAction, useState } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { useRecoilValue } from 'recoil';
import { Elements } from '../../../../../api/types/elements.interface';
import { ILambdaMeta } from '../../../../../api/types/meta.interface';
import { lambdaMetasAtom } from '../../../atoms/artboard.atoms';
import { createNode } from '../../../library/create-node';

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

type Props = {
  showCatalog: boolean;
  setShowCatalog: Dispatch<SetStateAction<boolean>>;
  setElements: Dispatch<SetStateAction<Elements>>;
  flowInstance: ReactFlowInstance;
};

export default function FlowboardLambdaCatalog({
  showCatalog,
  setShowCatalog,
  setElements,
  flowInstance,
}: Props) {
  const lambdaMetas = useRecoilValue(lambdaMetasAtom);
  const [search, setSearch] = useState('');

  // Called when the user adds a new node with the + button
  const addNode = (node: ILambdaMeta) => {
    const element = createNode(node, flowInstance.getNodes());
    // TODO: find better position, like the further right center without collision, rightest + 70px top: (max.top max.bottom / 2)
    element.position = { x: 0, y: 0 };

    setElements(elements => elements.concat(element));
    setShowCatalog(false);
  };

  return (
    <Drawer
      width="30vw"
      open={showCatalog}
      mask={false}
      className="h-screen gray-scroll"
      title="Node Catalog"
      onClose={() => setShowCatalog(false)}
    >
      <>
        <div className="px-1">
          <Input
            onChange={e => setSearch(e.target.value)}
            allowClear
            autoFocus={showCatalog}
            suffix={<SearchOutlined />}
          />
        </div>
        <Divider />
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
              className="bg-midnight-700"
              actions={[
                <Button
                  className="text-green-400"
                  onClick={() => addNode(lambda)}
                  icon={<PlusSquareOutlined />}
                ></Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`/admin/public/icons/${lambda.icon ?? 'lambda.png'}`}
                    className="rounded-lg w-12 h-12 p-1.5 bg-midnight-800"
                  />
                }
                title={
                  <span className="text-white">{startCase(lambda.type)}</span>
                }
                description={
                  lambda.description ?? 'Does not have a description?!'
                }
              />
            </List.Item>
          )}
        />
      </>
    </Drawer>
  );
}
