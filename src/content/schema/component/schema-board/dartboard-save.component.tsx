import { SaveOutlined } from '@ant-design/icons';

export default function DartBoardSaveComponent(props: {
  doSave: () => Promise<void>;
}) {
  return (
    <div onClick={() => props.doSave()} className={1 ? 'text-yellow-500' : ''}>
      <SaveOutlined />
      <div>Save Changes</div>
    </div>
  );
}
