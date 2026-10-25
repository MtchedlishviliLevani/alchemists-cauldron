import './styles/style.css';
import { StartScreen } from './ui/start-screen';

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  root.replaceChildren(StartScreen());
}
