import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendendo o tipo Request do Express para podermos guardar o ID do Admin lá dentro
export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  // 1. Pega o token que vem no cabeçalho da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    return;
  }

  // O padrão do mercado é enviar "Bearer [TOKEN]". Vamos separar a palavra Bearer do código.
  const [, token] = authHeader.split(' ');

  try {
    // 2. Verifica se o token é válido e não expirou, usando a nossa senha secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // 3. Se for válido, guarda os dados do admin na requisição e manda o fluxo continuar (next)
    req.admin = decoded as { id: string; email: string };
    
    next(); // "Pode passar!"
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}