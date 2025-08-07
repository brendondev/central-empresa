import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Docs from './pages/Docs';
import Rotas from './pages/Rotas';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/rotas" element={<Rotas />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
