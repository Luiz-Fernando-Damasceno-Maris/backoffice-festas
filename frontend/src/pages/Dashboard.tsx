import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  client_name: string;
  kit_name: string;
  event_date: string;
  negotiated_value: string | number;
  advance_fee: string | number;
  status_payment: string;
}

interface Kit {
  id: string;
  total_quantity: number | string;
}

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPhysicalKits, setTotalPhysicalKits] = useState(0); // Mudamos o nome do estado para ficar mais claro
  const [loading, setLoading] = useState(true);

  // Pegamos o nome do Admin
  const adminData = localStorage.getItem('@BackofficeFestas:admin');
  const adminName = adminData ? JSON.parse(adminData).name || 'Admin' : 'Admin';

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const [ordersRes, clientsRes, kitsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/clients'),
          api.get('/kits')
        ]);
        
        setOrders(ordersRes.data);
        setTotalClients(clientsRes.data.length);
        
        // CORREÇÃO 2: Somando as quantidades físicas do estoque (E não os nomes dos kits)
        const allKits: Kit[] = kitsRes.data;
        const sumOfKits = allKits.reduce((acc, kit) => acc + Number(kit.total_quantity || 0), 0);
        setTotalPhysicalKits(sumOfKits);

      } catch (error) {
        console.error('Erro ao carregar métricas', error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  // --- CÁLCULOS INTELIGENTES DO PAINEL ---

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // CORREÇÃO 1: Dinheiro a Receber (Cálculo Blindado contra nulos e letras maiúsculas/minúsculas)
  const totalReceivable = orders.reduce((acc, order) => {
    if (order.status_payment === 'PENDENTE' || order.status_payment === 'PARCIAL') {
      const finalValue = Number(order.negotiated_value || 0);
      const advancedValue = Number(order.advance_fee || 0);
      return acc + (finalValue - advancedValue);
    }
    return acc;
  }, 0);

  // 3. Próximas Festas (Filtra eventos futuros e pega apenas os 3 mais próximos)
  const today = new Date().toISOString().split('T')[0]; 
  
  const upcomingEvents = orders
    .filter(o => o.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 3); 

  function formatDateVisual(isoString: string) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); 
  }

  if (loading) {
    return <div className="flex justify-center mt-10"><p className="text-gray-500">A carregar métricas...</p></div>;
  }

  return (
    <div className="animate-fade-in pb-6">
      
      {/* CABEÇALHO */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Olá, {adminName} 👋</h2>
        <p className="text-sm text-gray-500">Aqui está o resumo da sua operação.</p>
      </div>

      {/* BLOCO FINANCEIRO PRINCIPAL */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg mb-6">
        <p className="text-sm text-indigo-100 mb-1">A Receber (Valores Pendentes)</p>
        <h3 className="text-3xl font-bold">{formatCurrency(totalReceivable)}</h3>
        <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1">
          <span>💡</span> Cobre os seus clientes antes das festas!
        </p>
      </div>

      {/* MINI CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">👥</span>
          <span className="text-xl font-bold text-gray-800">{totalClients}</span>
          <span className="text-xs text-gray-500 font-medium">Clientes</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">✨</span>
          <span className="text-xl font-bold text-gray-800">{totalPhysicalKits}</span>
          <span className="text-xs text-gray-500 font-medium">Kits em Estoque</span>
        </div>
      </div>

      {/* PRÓXIMAS FESTAS */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-lg font-bold text-gray-800">Próximas Festas</h3>
          <Link to="/pedidos" className="text-sm text-indigo-600 font-semibold">Ver agenda</Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white p-5 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 text-sm">Não há festas agendadas para os próximos dias.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-indigo-500 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-indigo-600 mb-1">{formatDateVisual(event.event_date)}</p>
                  <h4 className="font-bold text-gray-800 text-sm">{event.client_name}</h4>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">{event.kit_name}</p>
                </div>
                {event.status_payment === 'QUITADO' ? (
                   <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md">Quitado ✅</span>
                 ) : (
                   <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-md">Falta Pagar</span>
                 )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}