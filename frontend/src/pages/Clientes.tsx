import { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../services/api';

interface Client {
  id: string;
  name: string;
  whatsapp: string;
  full_address: string;
  cpf: string;
}

export function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Guardamos o ID do cliente que estamos a editar. Se for null, estamos a criar um novo.
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cpf, setCpf] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar clientes da base de dados.');
    } finally {
      setLoading(false);
    }
  }

  // 🎭 Máscaras
  function formatCPF(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }

  function formatPhone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }

  // 💾 Guardar (Serve para Criar e Editar)
  async function handleSaveClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { name, whatsapp, cpf, full_address: fullAddress };

      if (editingId) {
        // Se tem ID, é porque estamos a editar (PUT)
        await api.put(`/clients/${editingId}`, payload);
      } else {
        // Se não tem ID, é cliente novo (POST)
        await api.post('/clients', payload);
      }
      
      closeForm();
      loadClients();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert('Já existe um cliente com este CPF.');
      } else {
        alert('Erro ao salvar cliente.');
      }
    }
  }

  // 🗑️ Excluir Cliente
  async function handleDelete(id: string, name: string) {
    const confirmDelete = window.confirm(`Tem a certeza que deseja apagar a cliente ${name}?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        // O nosso Back-end protegendo a integridade!
        alert('Bloqueado: Não é possível apagar este cliente pois ele já possui contratos atrelados a ele.');
      } else {
        alert('Erro ao apagar cliente.');
      }
    }
  }

  // ✏️ Abrir formulário para edição
  function handleEdit(client: Client) {
    setName(client.name);
    setWhatsapp(client.whatsapp);
    setCpf(client.cpf);
    setFullAddress(client.full_address);
    setEditingId(client.id); // Define quem estamos editando
    setIsAdding(true);       // Abre a tela do formulário
  }

  function closeForm() {
    setName(''); setWhatsapp(''); setCpf(''); setFullAddress('');
    setEditingId(null);
    setIsAdding(false);
  }

  if (loading) return <div className="flex justify-center mt-10"><p className="text-gray-500">A carregar clientes...</p></div>;

  // --- MODO: FORMULÁRIO ---
  if (isAdding) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingId ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
            ✕ Voltar
          </button>
        </div>

        <form onSubmit={handleSaveClient} className="space-y-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome Completo</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp</label>
              <input required type="text" value={whatsapp} onChange={e => setWhatsapp(formatPhone(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">CPF</label>
              <input required type="text" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Endereço</label>
            <textarea required value={fullAddress} onChange={e => setFullAddress(e.target.value)} rows={3} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500" />
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 mt-4">
            {editingId ? 'Atualizar Cliente' : 'Guardar Cliente'}
          </button>
        </form>
      </div>
    );
  }

  // --- MODO: LISTA ---
  return (
    <div className="animate-fade-in pb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700">
          + Novo
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-xl border border-dashed border-gray-300">
          <span className="text-4xl">👥</span>
          <p className="text-gray-500 mt-2">Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <div key={client.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">{client.name}</h3>
                
                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(client)} className="text-gray-400 hover:text-indigo-600">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(client.id, client.name)} className="text-gray-400 hover:text-red-600">
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <span>💬</span> {client.whatsapp}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">CPF: {client.cpf}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                📍 {client.full_address}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}