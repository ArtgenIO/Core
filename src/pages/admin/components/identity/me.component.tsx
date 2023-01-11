import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Drawer, notification } from 'antd';
import md5 from 'md5';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { jwtAtom, profileAtom } from '../../atoms/admin.atoms';

type Props = {
  onClose: () => void;
};

export default function MeComponent({ onClose }: Props) {
  const resetJwt = useResetRecoilState(jwtAtom);
  const profile = useRecoilValue(profileAtom);

  return (
    <Drawer
      width={350}
      open
      title="Profile"
      closable
      onClose={() => onClose()}
      className="test--me-drawer"
    >
      <div className="text-center">
        <Avatar
          size={280}
          icon={<UserOutlined />}
          src={`https://www.gravatar.com/avatar/${md5(
            profile?.email,
          )}?d=identicon&s=280`}
          shape="square"
        />
      </div>
      <Divider />
      <p className="text-center">{profile?.email}</p>
      <Divider />
      <Button
        block
        key="profile"
        icon={<LockOutlined />}
        onClick={() => {
          resetJwt();

          notification.success({
            key: 'authentication',
            message: 'Bye bye! Come back soon <3',
            placement: 'bottomRight',
          });
        }}
        ghost
        className="test--sign-out warning"
      >
        Sign Out
      </Button>
    </Drawer>
  );
}
