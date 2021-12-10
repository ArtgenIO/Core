import { CSSProperties, PropsWithChildren } from 'react';
import './menu-block.component.less';

type Props = PropsWithChildren<{
  title: string;
  style?: CSSProperties;
}>;

export default function MenuBlock({ title, style, children }: Props) {
  return (
    <div className="menu-block">
      <header style={style}>{title}</header>
      <section>{children}</section>
    </div>
  );
}
