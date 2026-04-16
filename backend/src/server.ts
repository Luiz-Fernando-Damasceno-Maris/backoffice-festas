import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/auth.routes';
import { authMiddleware, AuthRequest } from './middlewares/authMiddleware';
import clientRoutes from './routes/clients.routes';
import itemRoutes from './routes/items.routes';
import kitRoutes from './routes/kits.routes';
import orderRoutes from './routes/orders.routes';

// Carrega as variáveis do .env
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// 1. Blindagem Básica (Helmet esconde headers do Express)
app.use(helmet());

// 2. Proteção contra Brute Force (Rate Limiting)
// Limita a 100 requisições a cada 15 minutos por IP (pode ajustar depois para o login)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// 3. CORS Restrito
// Por enquanto aceita tudo no localhost, mas no futuro limitaremos ao domínio da Vercel
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://seu-dominio-vercel.app' // URL do Front na Vercel (Sprint futura)
    : 'http://localhost:5173',         // URL do Front no Vite (Local)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

// Permitir que o Express entenda JSON no corpo das requisições
app.use(express.json());

// Rota de Teste de Saúde do Servidor (Health-Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    message: 'Backoffice API operando com sucesso!',
    timestamp: new Date().toISOString()
  });
});

// Rota de Teste da Base de Dados
app.get('/api/test-db', async (req, res) => {
  try {
    // Fazemos uma consulta simples para pedir a hora atual ao PostgreSQL
    const result = await pool.query('SELECT NOW() as db_time');
    
    res.status(200).json({ 
      status: 'sucesso', 
      message: 'Back-end e Supabase estão a comunicar perfeitamente!',
      hora_do_servidor_bd: result.rows[0].db_time
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'erro', message: 'Falha ao conectar ao Supabase' });
  }
});
app.use('/api/items', itemRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
// Registrando as rotas
app.use('/api/auth', authRoutes);
// Rota Protegida (Sala VIP)
app.get('/api/vip', authMiddleware, (req: AuthRequest, res) => {
  res.json({ 
    message: 'Bem-vindo à área VIP, chefe!', 
    seu_email_logado: req.admin?.email 
  });
});
// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🛡️  Segurança: Helmet, CORS e Rate-Limit ativados.`);
});