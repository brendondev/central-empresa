import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Docs from './pages/Docs';
import Rotas from './pages/Rotas';

export default function App() {
  // TODO: Implementar lógica global do App
  return (
    <Routes>
      <Route path="/chat" element={<Chat />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/rotas" element={<Rotas />} />
    </Routes>
  );
}
