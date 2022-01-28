import { Drawer, Tree } from 'antd';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import { IFlow } from '../../interface';

type Props = {
  flow: IFlow;
  lambdas: ILambdaMeta[];
  onClose: () => void;
};

export default function FlowContextExplorerComponent({
  flow,
  lambdas,
  onClose,
}: Props) {
  return (
    <Drawer
      visible
      width="30vw"
      onClose={onClose}
      maskClosable
      title="Context Explorer"
    >
      <Tree>// Context comes here</Tree>
    </Drawer>
  );
}
