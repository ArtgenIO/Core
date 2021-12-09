import { CSSProperties, PropsWithChildren } from 'react';
import './menu-block.component.less';

type Props = PropsWithChildren<{
  title: string;
  style?: CSSProperties;
}>;

export default function MenuBlock({ title, style, children }: Props) {
  return (
    <div>
      <div className="menu-block" style={style}>
        {title}
      </div>
      {children}
    </div>
  );
}
