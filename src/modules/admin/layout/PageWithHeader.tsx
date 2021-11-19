import { PropsWithChildren, ReactNode } from 'react';

type Props = {
  header: ReactNode;
} & PropsWithChildren<unknown>;

export default function PageWithHeader(props: Props) {
  return (
    <>
      {props.header}
      <div className="pb-96" style={{ paddingLeft: 25, paddingRight: 25 }}>
        {props.children}
      </div>
    </>
  );
}
