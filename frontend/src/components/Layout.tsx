import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('@BackofficeFestas:token');
    localStorage.removeItem('@BackofficeFestas:admin');
    navigate('/login');
  }

  // Função simples para saber se o botão do menu deve ficar "aceso" ou apagado
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-16">
      {/* Top Bar (Header Mobile) */}
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md z-10 sticky top-0">
        <h1 className="text-lg font-bold">🎉 Backoffice Festas</h1>
        <button 
          onClick={handleLogout} 
          className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 text-xs rounded-lg transition-colors"
        >
          Sair
        </button>
      </header>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation (A Barra de Baixo) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/dashboard') ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-semibold">Painel</span>
        </Link>

        <Link 
          to="/clientes" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/clientes') ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}
        >
          <span className="text-xl">👥</span>
          <span className="text-[10px] font-semibold">Clientes</span>
        </Link>

        <Link 
          to="/estoque" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/estoque') ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}
        >
          <span className="text-xl">📦</span>
          <span className="text-[10px] font-semibold">Estoque</span>
        </Link>

        <Link 
          to="/pedidos" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/pedidos') ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}
        >
          <span className="text-xl">📝</span>
          <span className="text-[10px] font-semibold">Pedidos</span>
        </Link>
      </nav>
    </div>
  );
}