import { UserOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import md5 from 'md5';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { profileAtom } from '../../admin/admin.atoms';
import MeComponent from './me.component';

export default function MeButtonComponent() {
  const [showProfile, setShowProfile] = useState(false);
  const profile = useRecoilValue(profileAtom);

  return (
    <>
      <div
        className="test-me-button w-full absolute bottom-0 py-2 cursor-pointer text-center bg-midnight-800 hover:bg-midnight-750 border-midnight-600"
        onClick={() => setShowProfile(true)}
        style={{ borderWidth: '1px 0 0 0', borderStyle: 'solid' }}
      >
        <Tooltip placement="right" title="Show Profile">
          <Avatar
            icon={<UserOutlined />}
            src={`https://www.gravatar.com/avatar/${md5(
              profile.email,
            )}?d=identicon&s=34`}
            size={34}
          />
        </Tooltip>
      </div>
      {showProfile && <MeComponent onClose={() => setShowProfile(false)} />}
    </>
  );
}
