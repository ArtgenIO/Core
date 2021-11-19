import { AvatarProps, PageHeader as PH } from 'antd';
import { ReactNode } from 'react';

type Props = {
  title: string | ReactNode;
  subTitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  avatar?: AvatarProps;
};

export default function PageHeader(props: Props) {
  return (
    <PH
      title={props.title}
      subTitle={props.subTitle}
      extra={props.actions}
      footer={props.footer}
      avatar={
        props.avatar
          ? {
              shape: 'square',
              size: 'large',
              className: 'bg-light-dark',
              ...props.avatar,
            }
          : undefined
      }
      className="mb-4"
    ></PH>
  );
}
