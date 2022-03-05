import 'react';
import ReactDOM from 'react-dom';
import Root from '../component/root.component';

window.global = window;

ReactDOM.render(Root(), document.getElementById('app'));
