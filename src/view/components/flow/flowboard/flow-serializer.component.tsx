import { Button, Divider, Drawer, message } from 'antd';
import { saveAs } from 'file-saver';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { IFlow } from '../../../../types/flow.interface';

type Props = {
  flow: IFlow;
  onClose: () => void;
};

export default function FlowBoardSerializer({ flow, onClose }: Props) {
  const doDownload = () => {
    const fileName = `flow-${flow.name}-${flow.id.substring(
      0,
      8,
    )}-${new Date().toISOString()}.json`;
    const fileContent = new Blob([JSON.stringify(flow, null, 2)], {
      type: 'application/json',
    });

    saveAs(fileContent, fileName);
    onClose();
  };

  const doCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(flow, null, 2));
    message.success('Flow copied to Your clipboard!', 2);

    onClose();
  };

  return (
    <Drawer open onClose={onClose} width="40vw" maskClosable>
      <Button.Group className="w-full">
        <Button block type="primary" ghost onClick={doDownload}>
          Download as JSON
        </Button>
        <Button block type="primary" onClick={doCopy}>
          Copy to Clipboard
        </Button>
      </Button.Group>
      <Divider />

      <SyntaxHighlighter
        className="bg-midnight-800 rounded-sm"
        language="json"
        style={nord}
        showLineNumbers={true}
        selected
      >
        {JSON.stringify(flow, null, 2)}
      </SyntaxHighlighter>
    </Drawer>
  );
}
