import React from 'react';
import { render } from 'react-dom';
import App from '@/ui/App';
import '@/fonts/inject.css';
import '@/themes/index.css';

render(<App />, document.getElementById('root'));

if (module.hot) module.hot.accept('./', () => {});
