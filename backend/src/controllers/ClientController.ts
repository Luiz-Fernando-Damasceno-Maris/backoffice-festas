import { Request, Response } from 'express';
import pool from '../config/db';

export class ClientController {
  
  // 1. Criar um novo cliente (Create)
  async create(req: Request, res: Response): Promise<void> {
    const { name, whatsapp, full_address, cpf } = req.body;

    try {
      const query = `
        INSERT INTO clients (name, whatsapp, full_address, cpf)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [name, whatsapp, full_address, cpf];
      
      const result = await pool.query(query, values);
      
      res.status(201).json({
        message: 'Cliente cadastrado com sucesso!',
        client: result.rows[0]
      });
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      // O código 23505 é o erro padrão do PostgreSQL para "Valor Duplicado" (UNIQUE)
      if (error.code === '23505') {
        res.status(400).json({ message: 'Já existe um cliente cadastrado com este CPF.' });
      } else {
        res.status(500).json({ message: 'Erro interno ao cadastrar cliente.' });
      }
    }
  }

  // 2. Listar todos os clientes (Read)
  async list(req: Request, res: Response): Promise<void> {
    try {
      // Trazemos os clientes ordenados pelos mais recentes
      const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ message: 'Erro interno ao buscar clientes.' });
    }
  }
  // 3. Atualizar um cliente (Update)
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, whatsapp, full_address, cpf } = req.body;

    try {
      const query = `
        UPDATE clients 
        SET name = $1, whatsapp = $2, full_address = $3, cpf = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
      `;
      
      const result = await pool.query(query, [name, whatsapp, full_address, cpf, id]);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Cliente não encontrado.' });
        return;
      }

      res.status(200).json({
        message: 'Cliente atualizado com sucesso!',
        client: result.rows[0]
      });
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      if (error.code === '23505') {
        res.status(400).json({ message: 'Já existe outro cliente com este CPF.' });
      } else {
        res.status(500).json({ message: 'Erro interno ao atualizar cliente.' });
      }
    }
  }

  // 4. Deletar um cliente (Delete)
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Cliente não encontrado.' });
        return;
      }

      res.status(200).json({ message: 'Cliente excluído com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      // Erro 23503: Violação de Chave Estrangeira (Tem pedidos atrelados)
      if (error.code === '23503') {
        res.status(400).json({ 
          message: 'Não é possível excluir este cliente pois existem contratos/pedidos amarrados a ele.' 
        });
      } else {
        res.status(500).json({ message: 'Erro interno ao excluir cliente.' });
      }
    }
  }
}