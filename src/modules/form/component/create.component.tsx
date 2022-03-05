import { Drawer } from 'antd';
import { ReactFormBuilder } from 'react-form-builder2';
import 'react-form-builder2/dist/app.css';
import './create.component.less';

type Props = {
  onClose: () => void;
};

export default function CreateFormComponent({ onClose }: Props) {
  var items = [
    {
      key: 'Header',
      name: 'Header Text',
      icon: 'fa fa-header',
      static: true,
      content: 'Placeholder Text...',
    },
    {
      key: 'Paragraph',
      name: 'Paragraph',
      static: true,
      icon: 'fa fa-paragraph',
      content: 'Placeholder Text...',
    },
  ];

  return (
    <Drawer visible onClose={onClose} width="40vw" maskClosable>
      <ReactFormBuilder saveUrl="path/to/POST/built/form.json" />
    </Drawer>
  );
}
