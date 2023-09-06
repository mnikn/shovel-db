import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/app';
import ipc from './electron/ipc';
import service from './services';
import './style.css';

ipc.init();
service.init();

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);
root.render(<App />);
