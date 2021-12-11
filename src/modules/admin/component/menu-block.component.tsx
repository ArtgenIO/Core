import { CSSProperties, PropsWithChildren } from 'react';
import './menu-block.component.less';

type Props = PropsWithChildren<{
  title: string;
  style?: CSSProperties;
  className?: string;
}>;

export default function MenuBlock({
  title,
  style,
  children,
  className,
}: Props) {
  return (
    <div className={'menu-block ' + className}>
      <header style={style}>{title}</header>
      <section>{children}</section>
    </div>
  );
}
