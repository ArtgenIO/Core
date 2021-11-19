import { useRecoilValue } from 'recoil';
import { pageDrawerAtom } from '../admin.atoms';
import './PageDrawer.css';

export default function PageDrawer(): JSX.Element {
  const drawerState = useRecoilValue(pageDrawerAtom);

  if (!drawerState) {
    return <></>;
  }

  return <div className="right-sider h-full">{drawerState}</div>;
}
