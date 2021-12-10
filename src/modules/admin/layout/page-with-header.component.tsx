import { PropsWithChildren, ReactNode } from 'react';

type Props = {
  header: ReactNode;
} & PropsWithChildren<unknown>;

export default function PageWithHeader(props: Props) {
  return (
    <div className="h-screen gray-scroll">
      {props.header}
      <div className="px-6">{props.children}</div>
    </div>
  );
}
