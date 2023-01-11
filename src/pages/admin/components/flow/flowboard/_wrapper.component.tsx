import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import FlowBoardComponent from './flowboard.component';

export default function FlowBoardWrapperComponent() {
  return (
    <ReactFlowProvider>
      <FlowBoardComponent />
    </ReactFlowProvider>
  );
}
