import { LogoutOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, notification } from 'antd';
import { useResetRecoilState } from 'recoil';
import { jwtAtom } from '../../admin/admin.atoms';

type Props = {
  onClose: () => void;
};

export default function MeComponent({ onClose }: Props) {
  const resetJwt = useResetRecoilState(jwtAtom);

  return (
    <Drawer
      width={350}
      visible
      title="The Artisan"
      closable
      onClose={() => onClose()}
    >
      <div className="text-center">
        <Avatar
          size={280}
          src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&amp;s=300"
        />
      </div>
      <Divider />
      <Button
        block
        danger
        key="profile"
        icon={<LogoutOutlined />}
        onClick={() => {
          resetJwt();

          notification.success({
            message: 'Bye bye! Come back soon <3',
            placement: 'bottomRight',
          });
        }}
        className="test--sign-out"
      >
        Sign Out
      </Button>
    </Drawer>
  );
}
