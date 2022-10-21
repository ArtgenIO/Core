import 'react';
import { createRoot } from 'react-dom/client';
import RootComponent from '../component/root.component';
import './style/main.less';


window.global = window;

const mount = document.getElementById('app');
const root = createRoot(mount);

root.render(<RootComponent />);