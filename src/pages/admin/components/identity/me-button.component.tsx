import { UserOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import md5 from 'md5';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { profileAtom } from '../../atoms/admin.atoms';
import MeComponent from './me.component';

export default function MeButtonComponent() {
  const [openProfile, setOpenProfile] = useState(false);
  const profile = useRecoilValue(profileAtom);

  return (
    <>
      <div
        className="test--me-button w-full absolute bottom-0 py-2 cursor-pointer text-center bg-midnight-800 hover:bg-midnight-750 border-midnight-600"
        onClick={() => setOpenProfile(true)}
        style={{ borderWidth: '1px 0 0 0', borderStyle: 'solid' }}
      >
        <Tooltip placement="right" title="Show Profile">
          <Avatar
            icon={<UserOutlined />}
            src={`https://www.gravatar.com/avatar/${md5(
              profile?.email,
            )}?d=identicon&s=36`}
            size={36}
            shape="square"
          />
        </Tooltip>
      </div>
      {openProfile && <MeComponent onClose={() => setOpenProfile(false)} />}
    </>
  );
}
