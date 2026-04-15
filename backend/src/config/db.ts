import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Criamos um "Pool" de ligações. Em vez de abrir e fechar a BD a cada pedido,
// o Node mantém algumas ligações abertas e reaproveita-as, poupando muita memória.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // O Supabase exige SSL (ligação segura) para conexões externas
  }
});

// Evento para avisar no terminal quando a ligação for bem-sucedida
pool.on('connect', () => {
  console.log('📦 Ligação à Base de Dados estabelecida com sucesso!');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado na Base de Dados:', err);
});

export default pool;