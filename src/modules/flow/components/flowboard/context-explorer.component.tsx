import { Drawer } from 'antd';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { ILambdaMeta } from '../../../lambda/interface/meta.interface';
import { IFlow } from '../../interface';
import { ICapturedContext } from '../../interface/captured-context.interface';

type Props = {
  flow: IFlow;
  lambdas: ILambdaMeta[];
  onClose: () => void;
  appliedContext: ICapturedContext;
};

export default function FlowContextExplorerComponent({
  flow,
  lambdas,
  onClose,
  appliedContext,
}: Props) {
  const [contextCode, setContextCode] = useState<string>('');

  useEffect(() => {
    setContextCode(
      appliedContext
        ? JSON.stringify(appliedContext.context, null, 2)
        : 'Select a context',
    );
  }, [appliedContext]);

  return (
    <Drawer
      visible
      width="30vw"
      onClose={onClose}
      maskClosable
      title="Context Explorer"
    >
      <SyntaxHighlighter
        className="bg-midnight-800 rounded-sm"
        language="json"
        style={nord}
        showLineNumbers={true}
        selected
      >
        {contextCode}
      </SyntaxHighlighter>
    </Drawer>
  );
}
