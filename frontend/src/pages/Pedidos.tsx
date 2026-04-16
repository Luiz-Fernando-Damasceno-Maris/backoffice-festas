import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Client { id: string; name: string; }
interface Kit { id: string; name: string; base_price: number | string; }
interface Order {
  id: string;
  client_id: string;
  kit_id: string;
  client_name: string; // Vindo do JOIN do backend
  kit_name: string;    // Vindo do JOIN do backend
  event_date: string;
  assembly_time: string;
  retrieval_time: string;
  negotiated_value: string | number;
  advance_fee: string | number;
  status_payment: string;
}

export function Pedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos do Formulário
  const [clientId, setClientId] = useState('');
  const [kitId, setKitId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [assemblyTime, setAssemblyTime] = useState('');
  const [retrievalTime, setRetrievalTime] = useState('');
  const [negotiatedValue, setNegotiatedValue] = useState('');
  const [advanceFee, setAdvanceFee] = useState('');
  const [statusPayment, setStatusPayment] = useState('PENDENTE');

  useEffect(() => {
    loadAllData();
  }, []);

  // Carrega tudo o que precisamos para a tela funcionar
  async function loadAllData() {
    try {
      setLoading(true);
      const [ordersRes, clientsRes, kitsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/clients'),
        api.get('/kits')
      ]);
      setOrders(ordersRes.data);
      setClients(clientsRes.data);
      setKits(kitsRes.data);
    } catch (error) {
      alert('Erro ao carregar dados do sistema.');
    } finally {
      setLoading(false);
    }
  }

  // 🎭 Funções Auxiliares de Máscara de Moeda
  function formatCurrencyVisual(value: string | number) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handleCurrencyInput(e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) value = '0';
    setter((parseInt(value, 10) / 100).toFixed(2));
  }

  // 🤖 Automação: Quando seleciona um Kit, puxa o preço base para o Valor Negociado
  function handleKitSelection(selectedKitId: string) {
    setKitId(selectedKitId);
    const selectedKit = kits.find(k => k.id === selectedKitId);
    if (selectedKit) {
      setNegotiatedValue(String(selectedKit.base_price));
    }
  }

  // 💾 Guardar Pedido
  async function handleSaveOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !kitId) {
      alert('Selecione um Cliente e um Kit!');
      return;
    }

    try {
      const payload = {
        client_id: clientId,
        kit_id: kitId,
        event_date: eventDate,
        assembly_time: assemblyTime || null,
        retrieval_time: retrievalTime || null,
        negotiated_value: Number(negotiatedValue),
        advance_fee: Number(advanceFee || 0),
        status_payment: statusPayment
      };

      if (editingId) {
        await api.put(`/orders/${editingId}`, payload);
      } else {
        await api.post('/orders', payload);
      }
      
      closeForm();
      loadAllData(); // Recarrega a lista
    } catch (error) {
      alert('Erro ao guardar pedido.');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem a certeza que deseja cancelar e apagar este pedido?')) return;
    try {
      await api.delete(`/orders/${id}`);
      loadAllData();
    } catch (error) {
      alert('Erro ao apagar pedido.');
    }
  }

  function handleEdit(order: Order) {
    setClientId(order.client_id);
    setKitId(order.kit_id);
    
    // Formatando as datas para o Input do HTML aceitar (YYYY-MM-DD)
    setEventDate(order.event_date ? order.event_date.split('T')[0] : '');
    
    // Formatando Data/Hora (YYYY-MM-DDTHH:MM)
    const formatDateTime = (isoString: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : '';
    setAssemblyTime(formatDateTime(order.assembly_time));
    setRetrievalTime(formatDateTime(order.retrieval_time));

    setNegotiatedValue(String(order.negotiated_value));
    setAdvanceFee(String(order.advance_fee));
    setStatusPayment(order.status_payment || 'PENDENTE');
    
    setEditingId(order.id);
    setIsAdding(true);
  }

  function closeForm() {
    setClientId(''); setKitId(''); setEventDate(''); setAssemblyTime(''); setRetrievalTime('');
    setNegotiatedValue(''); setAdvanceFee(''); setStatusPayment('PENDENTE');
    setEditingId(null); setIsAdding(false);
  }

  // Formatar data visual (DD/MM/YYYY)
  function formatDateVisual(isoString: string) {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Adicionamos fuso horário local para não dar diferença de 1 dia
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR'); 
  }

  if (loading) return <div className="flex justify-center mt-10"><p className="text-gray-500">A carregar agenda...</p></div>;

  // --- MODO: FORMULÁRIO ---
  if (isAdding) {
    return (
      <div className="animate-fade-in pb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Pedido' : 'Novo Contrato'}</h2>
          <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">✕ Voltar</button>
        </div>

        <form onSubmit={handleSaveOrder} className="space-y-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          
          {/* SELEÇÃO DE CLIENTE E KIT */}
          <div className="space-y-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">1. Selecione o Cliente</label>
              <select required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500">
                <option value="" disabled>Escolha um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">2. Selecione o Kit</label>
              <select required value={kitId} onChange={e => handleKitSelection(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500">
                <option value="" disabled>Escolha um kit...</option>
                {kits.map(k => <option key={k.id} value={k.id}>{k.name} ({formatCurrencyVisual(k.base_price)})</option>)}
              </select>
            </div>
          </div>

          {/* DATAS E HORÁRIOS */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data do Evento (Festa)</label>
              <input required type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Montagem</label>
                <input type="datetime-local" value={assemblyTime} onChange={e => setAssemblyTime(e.target.value)} className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Retirada</label>
                <input type="datetime-local" value={retrievalTime} onChange={e => setRetrievalTime(e.target.value)} className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
            </div>
          </div>

          {/* FINANCEIRO */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Valor Final Fechado</label>
              <input required type="text" value={formatCurrencyVisual(negotiatedValue)} onChange={e => handleCurrencyInput(e, setNegotiatedValue)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-indigo-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sinal Pago (Adiantamento)</label>
              <input type="text" value={formatCurrencyVisual(advanceFee)} onChange={e => handleCurrencyInput(e, setAdvanceFee)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-green-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status do Pagamento</label>
            <select value={statusPayment} onChange={e => setStatusPayment(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                <option value="PENDENTE">⏳ Pendente (Nada pago ainda)</option>
                <option value="PARCIAL">🪙 Parcial (Sinal pago)</option>
                <option value="QUITADO">✅ Quitado (100% Pago)</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 mt-4">
            {editingId ? 'Atualizar Pedido' : 'Gerar Pedido'}
          </button>
        </form>
      </div>
    );
  }

  // --- MODO: LISTA (AGENDA) ---
  return (
    <div className="animate-fade-in pb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700">
          + Novo
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-xl border border-dashed border-gray-300">
          <span className="text-4xl">📅</span>
          <p className="text-gray-500 mt-2">Sua agenda está livre.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const missingToPay = Number(order.negotiated_value) - Number(order.advance_fee);
            const isFullyPaid = order.status_payment === 'QUITADO';

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cabeçalho do Card: Data e Status */}
                <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold text-white ${isFullyPaid ? 'bg-green-500' : order.status_payment?.toUpperCase() === 'PENDENTE' ? 'bg-red-500' : 'bg-orange-400'}`}>
                  <span>📅 Festa: {formatDateVisual(order.event_date)}</span>
                  <span>{order.status_payment.toUpperCase()}</span>
                </div>
                
                {/* Corpo do Card */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{order.client_name}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{order.kit_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(order)} className="text-gray-400 hover:text-indigo-600">✏️</button>
                      <button onClick={() => handleDelete(order.id)} className="text-gray-400 hover:text-red-600">🗑️</button>
                    </div>
                  </div>

                  {/* Financeiro */}
                  <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-100 flex justify-between text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Total Fechado</p>
                      <p className="font-bold text-gray-800">{formatCurrencyVisual(order.negotiated_value)}</p>
                    </div>
                    {!isFullyPaid && missingToPay > 0 && (
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Falta Receber</p>
                        <p className="font-bold text-orange-600">{formatCurrencyVisual(missingToPay)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}