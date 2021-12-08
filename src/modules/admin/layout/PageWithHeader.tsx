import { PropsWithChildren, ReactNode } from 'react';

type Props = {
  header: ReactNode;
} & PropsWithChildren<unknown>;

export default function PageWithHeader(props: Props) {
  return (
    <div className="min-h-screen">
      {props.header}
      <div className="px-6">{props.children}</div>
    </div>
  );
}
