import { SaveOutlined } from '@ant-design/icons';

export default function DatabaseSaveComponent(props: {
  doSave: () => Promise<void>;
}) {
  return (
    <div onClick={() => props.doSave()} className={0 ? 'text-yellow-500' : ''}>
      <SaveOutlined />
      <div>Save Changes</div>
    </div>
  );
}
