import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      // 1. Busca o admin no banco pelo email
      const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
      const admin = result.rows[0];

      // 2. Se o email não existir, barra o acesso
      if (!admin) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
      }

      // 3. Compara a senha digitada com o Hash salvo no banco
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
      }

      // 4. Se tudo estiver certo, gera o Token JWT
      // O token vai carregar o ID do admin e durar 7 dias
      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );
      
      console.log('\n✅ LOGIN BEM-SUCEDIDO! Aqui está o seu Token JWT: \n', token, '\n');

      res.status(200).json({
        message: 'Login bem-sucedido!',
        token,
        admin: { email: admin.email }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}