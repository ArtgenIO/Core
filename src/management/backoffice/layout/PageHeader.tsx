import { AvatarProps, PageHeader as PH } from 'antd';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { breadcrumbsAtom } from '../backoffice.atoms';

type Props = {
  title: string;
  subTitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  avatar?: AvatarProps;
};

export default function PageHeader(props: Props) {
  const breadcrumbsState = useRecoilValue(breadcrumbsAtom);

  return (
    <PH
      onBack={
        props.title === 'Dashboard' ? undefined : () => window.history.back()
      }
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
      breadcrumb={{ routes: breadcrumbsState }}
      className="mb-4"
    ></PH>
  );
}
