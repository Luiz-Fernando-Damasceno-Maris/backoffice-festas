import { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../services/api';

interface Item {
  id: string;
  name: string;
  replacement_value: string | number;
}

interface Kit {
  id: string;
  name: string;
  base_price: string | number;
  total_quantity: number;
  image_url: string | null;
  items: Item[]; // O nosso Back-end já devolve as peças embutidas aqui!
}

export function Estoque() {
  const [activeTab, setActiveTab] = useState<'kits' | 'itens'>('itens');
  
  // 📦 Estados: ITENS (Peças)
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');

  // 🎁 Estados: KITS
  const [kits, setKits] = useState<Kit[]>([]);
  const [loadingKits, setLoadingKits] = useState(false);
  const [isAddingKit, setIsAddingKit] = useState(false);
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  
  const [kitName, setKitName] = useState('');
  const [kitPrice, setKitPrice] = useState('');
  const [kitQuantity, setKitQuantity] = useState('1');
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Array com os IDs das peças escolhidas

  // 📷 Estados: IMAGEM DO KIT
  const [kitImage, setKitImage] = useState<File | null>(null);
  const [kitImagePreview, setKitImagePreview] = useState<string | null>(null);

  // 🔄 Efeitos
  useEffect(() => {
    if (activeTab === 'itens') loadItems();
    if (activeTab === 'kits') {
      loadKits();
      loadItems(); // Precisamos carregar as peças também para mostrar nos Checkboxes do Kit
    }
  }, [activeTab]);

  // --- LÓGICA DOS ITENS ---
  async function loadItems() {
    try {
      setLoadingItems(true);
      const response = await api.get('/items');
      setItems(response.data);
    } catch (error) {
      alert('Erro ao carregar peças.');
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { name: itemName, replacement_value: Number(itemValue) };
      if (editingItemId) await api.put(`/items/${editingItemId}`, payload);
      else await api.post('/items', payload);
      
      closeItemForm();
      loadItems();
    } catch (error) {
      alert('Erro ao guardar peça.');
    }
  }

  async function handleDeleteItem(id: string, name: string) {
    if (!window.confirm(`Apagar a peça "${name}"?`)) return;
    try {
      await api.delete(`/items/${id}`);
      loadItems();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert('Bloqueado: Esta peça já faz parte de um Kit e não pode ser apagada.');
      } else alert('Erro ao apagar peça.');
    }
  }

  function handleEditItem(item: Item) {
    setItemName(item.name); setItemValue(String(item.replacement_value));
    setEditingItemId(item.id); setIsAddingItem(true);
  }

  function closeItemForm() {
    setItemName(''); setItemValue('');
    setEditingItemId(null); setIsAddingItem(false);
  }

  // --- LÓGICA DOS KITS ---
  async function loadKits() {
    try {
      setLoadingKits(true);
      const response = await api.get('/kits');
      setKits(response.data);
    } catch (error) {
      alert('Erro ao carregar kits.');
    } finally {
      setLoadingKits(false);
    }
  }

  // Adiciona ou Remove o ID da peça do array de selecionados
  function toggleItemSelection(itemId: string) {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId)); // Remove se já estava
    } else {
      setSelectedItems([...selectedItems, itemId]); // Adiciona se não estava
    }
  }

  // 📷 Handler para seleção de imagem
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setKitImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setKitImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setKitImagePreview(null);
    }
  }

  async function handleSaveKit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos uma peça para montar o Kit!');
      return;
    }

    try {
      // Se tem imagem, envia como FormData (multipart)
      // Senão, envia como JSON normal
      if (kitImage) {
        const formData = new FormData();
        formData.append('name', kitName);
        formData.append('base_price', kitPrice);
        formData.append('total_quantity', kitQuantity);
        formData.append('item_ids', JSON.stringify(selectedItems));
        formData.append('image', kitImage);

        if (editingKitId) {
          await api.put(`/kits/${editingKitId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.post('/kits', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        // Sem imagem — mantém o comportamento original com JSON
        const payload = { 
          name: kitName, 
          base_price: Number(kitPrice), 
          total_quantity: Number(kitQuantity),
          item_ids: selectedItems 
        };

        if (editingKitId) await api.put(`/kits/${editingKitId}`, payload);
        else await api.post('/kits', payload);
      }
      
      closeKitForm();
      loadKits();
    } catch (error) {
      alert('Erro ao guardar kit.');
    }
  }

  async function handleDeleteKit(id: string, name: string) {
    if (!window.confirm(`Apagar o Kit "${name}"?`)) return;
    try {
      await api.delete(`/kits/${id}`);
      loadKits();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert('Bloqueado: Este kit não pode ser apagado pois já está num Pedido.');
      } else alert('Erro ao apagar kit.');
    }
  }

  function handleEditKit(kit: Kit) {
    setKitName(kit.name);
    setKitPrice(String(kit.base_price));
    setKitQuantity(String(kit.total_quantity));
    
    // Extrai só os IDs das peças que já vieram atreladas ao Kit
    const itemIds = kit.items.map(item => item.id);
    setSelectedItems(itemIds);

    // Se o kit já tem imagem, mostra o preview
    setKitImage(null); // Não temos o File, mas temos o URL
    setKitImagePreview(kit.image_url || null);
    
    setEditingKitId(kit.id);
    setIsAddingKit(true);
  }

  function closeKitForm() {
    setKitName(''); setKitPrice(''); setKitQuantity('1'); setSelectedItems([]);
    setKitImage(null); setKitImagePreview(null);
    setEditingKitId(null); setIsAddingKit(false);
  }

  // 🎭 Funções Auxiliares de Formatação
  function formatCurrencyVisual(value: string | number) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handleCurrencyInput(e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) value = '0';
    setter((parseInt(value, 10) / 100).toFixed(2));
  }

  return (
    <div className="animate-fade-in pb-4">
      
      {/* 🧭 NAVEGAÇÃO DE ABAS (Esconde se estivermos a editar algo) */}
      {!isAddingItem && !isAddingKit && (
        <div className="flex bg-gray-200 p-1 rounded-xl mb-6 shadow-inner">
          <button 
            onClick={() => setActiveTab('kits')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'kits' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Kits Montados
          </button>
          <button 
            onClick={() => setActiveTab('itens')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'itens' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Peças Avulsas
          </button>
        </div>
      )}

      {/* ------------------------------------------- */}
      {/* 🧩 ABA: PEÇAS AVULSAS */}
      {/* ------------------------------------------- */}
      {activeTab === 'itens' && (
        <>
          {isAddingItem ? (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{editingItemId ? 'Editar Peça' : 'Nova Peça'}</h3>
                <button onClick={closeItemForm} className="text-gray-500 text-sm">✕ Voltar</button>
              </div>
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Peça</label>
                  <input required type="text" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valor de Reposição (R$)</label>
                  <input required type="text" value={formatCurrencyVisual(itemValue)} onChange={e => handleCurrencyInput(e, setItemValue)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Guardar Peça</button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Inventário de Peças</h2>
                <button onClick={() => setIsAddingItem(true)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">+ Nova Peça</button>
              </div>
              {loadingItems ? <p className="text-center text-gray-500 mt-10">A carregar...</p> : items.length === 0 ? <p className="text-center text-gray-500 mt-10">Nenhuma peça cadastrada.</p> : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                        <p className="text-xs text-red-500 font-medium">Reposição: {formatCurrencyVisual(item.replacement_value)}</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleEditItem(item)} className="text-gray-400 hover:text-indigo-600 text-sm">✏️</button>
                        <button onClick={() => handleDeleteItem(item.id, item.name)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ------------------------------------------- */}
      {/* 🎁 ABA: KITS MONTADOS */}
      {/* ------------------------------------------- */}
      {activeTab === 'kits' && (
        <>
          {isAddingKit ? (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{editingKitId ? 'Editar Kit' : 'Novo Kit'}</h3>
                <button onClick={closeKitForm} className="text-gray-500 text-sm">✕ Voltar</button>
              </div>
              
              <form onSubmit={handleSaveKit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Kit</label>
                  <input required type="text" value={kitName} onChange={e => setKitName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="Ex: Kit Jardim Encantado" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Preço Base (R$)</label>
                    <input required type="text" value={formatCurrencyVisual(kitPrice)} onChange={e => handleCurrencyInput(e, setKitPrice)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade Físicas</label>
                    <input required type="number" min="1" value={kitQuantity} onChange={e => setKitQuantity(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                  </div>
                </div>

                {/* 📷 UPLOAD DE IMAGEM */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Foto do Kit (opcional)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 w-full p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                        <span className="text-lg">📷</span>
                        <span className="text-sm font-medium">{kitImage ? kitImage.name : 'Escolher imagem...'}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/gif" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                    {kitImagePreview && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-indigo-200 flex-shrink-0">
                        <img src={kitImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setKitImage(null); setKitImagePreview(null); }}
                          className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl-md"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* LISTA DE CHECKBOXES PARA PEÇAS */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-800 mb-2">Selecione as Peças deste Kit:</label>
                  {items.length === 0 ? (
                    <p className="text-xs text-red-500">Nenhuma peça cadastrada! Volte na aba de Peças e cadastre primeiro.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                      {items.map(item => (
                        <label key={item.id} className="flex items-center gap-3 p-2 bg-white rounded shadow-sm border border-gray-100 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <span className="block text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 mt-4">
                  {editingKitId ? 'Atualizar Kit' : 'Salvar Kit'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Catálogo de Kits</h2>
                <button onClick={() => setIsAddingKit(true)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">+ Novo Kit</button>
              </div>

              {loadingKits ? <p className="text-center text-gray-500 mt-10">A carregar...</p> : kits.length === 0 ? <p className="text-center text-gray-500 mt-10">Nenhum kit montado.</p> : (
                <div className="space-y-3">
                  {kits.map(kit => (
                    <div key={kit.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                      <div className="flex gap-3">
                        {/* Miniatura da imagem */}
                        {kit.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            <img src={kit.image_url} alt={kit.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-indigo-900">{kit.name}</h3>
                            <div className="flex gap-3">
                              <button onClick={() => handleEditKit(kit)} className="text-gray-400 hover:text-indigo-600 text-sm">✏️</button>
                              <button onClick={() => handleDeleteKit(kit.id, kit.name)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 text-sm mt-1">
                            <span className="font-bold text-green-600">{formatCurrencyVisual(kit.base_price)}</span>
                            <span className="text-gray-500">Estoque: {kit.total_quantity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mostrando as peças cadastradas em forma de "tags" */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {kit.items && kit.items.length > 0 ? (
                          kit.items.map(item => (
                            <span key={item.id} className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-1 rounded-full border border-indigo-100">
                              {item.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Nenhuma peça atrelada.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  );
}