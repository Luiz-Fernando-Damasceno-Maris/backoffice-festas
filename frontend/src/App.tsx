import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import type { JSX } from 'react';
import { Clientes } from './pages/Clientes';
import { Estoque } from './pages/Estoque';
import { Pedidos } from './pages/Pedidos';
import { Dashboard } from './pages/Dashboard';

// 🛡️ COMPONENTE DE PROTEÇÃO: Se não tiver token, chuta pro Login!
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('@BackofficeFestas:token');
  return token ? children : <Navigate to="/login" replace />;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Todas as rotas DENTRO do Layout passam pela proteção */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          // Aqui dentro ficam as rotas que aparecem DENTRO do Layout (com a barra de baixo e o header)
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="pedidos" element={<Pedidos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;