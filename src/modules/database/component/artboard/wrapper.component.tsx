import { ReactFlowProvider } from 'react-flow-renderer';
import DatabaseArtboardComponent from './artboard.component';

export default function ArtboardWrapper() {
  return (
    <ReactFlowProvider>
      <DatabaseArtboardComponent />
    </ReactFlowProvider>
  );
}
