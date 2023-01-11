import { Drawer } from 'antd';
import { ReactFormBuilder } from 'react-form-builder2';
import 'react-form-builder2/dist/app.css';
import './create.component.less';

type Props = {
  onClose: () => void;
};

export default function CreateFormComponent({ onClose }: Props) {
  return (
    <Drawer open onClose={onClose} width="40vw" maskClosable>
      <ReactFormBuilder saveUrl="path/to/POST/built/form.json" />
    </Drawer>
  );
}
