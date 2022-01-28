import { ReactFlowProvider } from 'react-flow-renderer';
import FlowBoardComponent from './flowboard.component';

export default function FlowBoardWrapperComponent() {
  return (
    <ReactFlowProvider>
      <FlowBoardComponent />
    </ReactFlowProvider>
  );
}
