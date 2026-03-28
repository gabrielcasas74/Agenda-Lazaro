import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Reservar } from './pages/Reservar';
import './index.css';

const isReservar = window.location.pathname.startsWith('/reservar');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isReservar ? <Reservar /> : <App />}
  </React.StrictMode>
);
