import { useState, useEffect } from 'react';
import axios from 'axios';

interface KitItem {
  id: string;
  name: string;
}

interface Kit {
  id: string;
  name: string;
  base_price: string | number;
  image_url: string | null;
  items: KitItem[];
}

// Número de WhatsApp da loja (variável de ambiente ou placeholder)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_LOJA || '5500000000000';
const API_BASE = import.meta.env.VITE_API_URL || 'https://backoffice-festas-api.onrender.com/api';

export function Catalogo() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadKits();
  }, []);

  async function loadKits() {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`${API_BASE}/kits/public`);
      setKits(response.data);
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: string | number) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function buildWhatsAppLink(kitName: string) {
    const message = encodeURIComponent(
      `Olá! Vi o *${kitName}* na vitrine e gostava de saber se está disponível.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }

  // --- RENDERIZAÇÃO ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg">A carregar a vitrine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo correu mal.</h2>
          <p className="text-gray-500 mb-6">Não conseguimos carregar os nossos kits. Tente novamente.</p>
          <button
            onClick={loadKits}
            className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* HEADER DA VITRINE */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              🎉 Ale Maris Mini Festas
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">Kits encantadores para a sua festa</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-green-500/25"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Falar Connosco
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-16 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Transforme a sua festa
          <br />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            num momento mágico ✨
          </span>
        </h2>
        <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
          Conheça os nossos kits temáticos prontos para alugar. Cada kit inclui peças decorativas selecionadas com carinho.
        </p>
      </section>

      {/* GRID DE KITS */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {kits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎀</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">A vitrine está a ser preparada!</h3>
            <p className="text-gray-400">Em breve teremos novos kits disponíveis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* IMAGEM DO KIT */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                  {kit.image_url ? (
                    <img
                      src={kit.image_url}
                      alt={kit.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl block mb-2">🎁</span>
                        <span className="text-sm text-purple-400 font-medium">Foto em breve</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Badge do preço */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                    <span className="text-sm font-extrabold text-pink-600">{formatCurrency(kit.base_price)}</span>
                  </div>
                </div>

                {/* INFORMAÇÕES DO KIT */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{kit.name}</h3>

                  {/* Itens incluídos */}
                  {kit.items && kit.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Inclui:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {kit.items.map((item) => (
                          <span
                            key={item.id}
                            className="bg-purple-50 text-purple-600 text-[11px] px-2.5 py-1 rounded-full border border-purple-100 font-medium"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão WhatsApp */}
                  <a
                    href={buildWhatsAppLink(kit.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Tenho Interesse
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Ale Maris Mini Festas · Feito com 💖
        </p>
        {/* Botão flutuante WhatsApp (mobile) */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-500/40 z-50 hover:bg-green-600 transition-colors"
          aria-label="Contactar por WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </footer>
    </div>
  );
}
