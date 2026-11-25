import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/big-shoulders-display/latin-900';
import '@fontsource/dm-sans/latin-400';
import '@fontsource/dm-sans/latin-500';
import '@fontsource/dm-sans/latin-700';
import '@fontsource/dm-mono/latin-400';
import '@fontsource/dm-mono/latin-500';
import '@fontsource/tilt-neon/latin-400';
import './styles/tokens.css';
import './styles/base.css';
import './styles/header-hero.css';
import './styles/menu.css';
import './styles/modal.css';
import './styles/cart.css';
import './styles/info.css';
import './styles/showcase.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
