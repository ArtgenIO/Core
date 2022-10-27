import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import DatabaseArtboardComponent from './artboard.component';

export default function ArtboardWrapper() {
  return (
    <ReactFlowProvider>
      <DatabaseArtboardComponent />
    </ReactFlowProvider>
  );
}
