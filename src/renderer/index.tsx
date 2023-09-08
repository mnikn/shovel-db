import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/app';
import ipc from './electron/ipc';
import { initServices } from './services';
import './style.css';

ipc.init();
initServices();

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);
root.render(<App />);
