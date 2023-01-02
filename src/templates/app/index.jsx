// import 'react-devtools'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/ui/App';
import '@/../public/fonts/inject.css';
import '@/themes/index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

if (module.hot) module.hot.accept('./', () => {});
