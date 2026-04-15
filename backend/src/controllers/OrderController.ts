import { Request, Response } from 'express';
import pool from '../config/db';

export class OrderController {
  
  // 1. Criar um novo Pedido
  async create(req: Request, res: Response): Promise<void> {
    const { 
      client_id, kit_id, event_date, assembly_time, retrieval_time, 
      negotiated_value, advance_fee 
    } = req.body;

    try {
      const query = `
        INSERT INTO orders (
          client_id, kit_id, event_date, assembly_time, retrieval_time, 
          negotiated_value, advance_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
      `;
      
      const values = [
        client_id, kit_id, event_date, assembly_time, retrieval_time, 
        negotiated_value, advance_fee
      ];

      const result = await pool.query(query, values);
      
      res.status(201).json({ 
        message: 'Pedido criado e agendado com sucesso!', 
        order: result.rows[0] 
      });
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ message: 'Erro interno ao criar pedido.' });
    }
  }

  // 2. Listar os Pedidos (Com dados do Cliente e do Kit juntos)
  async list(req: Request, res: Response): Promise<void> {
    try {
      // Fazemos o JOIN para que o Front-end receba os nomes em vez de apenas UUIDs
      const query = `
        SELECT 
          o.*,
          c.name AS client_name,
          c.whatsapp AS client_whatsapp,
          k.name AS kit_name
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        JOIN kits k ON o.kit_id = k.id
        ORDER BY o.event_date ASC;
      `;
      const result = await pool.query(query);
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ message: 'Erro interno ao buscar pedidos.' });
    }
  }
  // 3. Atualizar um Pedido (Update)
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { 
      client_id, kit_id, event_date, assembly_time, retrieval_time, 
      negotiated_value, advance_fee, status_payment 
    } = req.body;

    try {
      const query = `
        UPDATE orders 
        SET client_id = $1, kit_id = $2, event_date = $3, assembly_time = $4, 
            retrieval_time = $5, negotiated_value = $6, advance_fee = $7, status_payment = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *;
      `;
      
      const values = [
        client_id, kit_id, event_date, assembly_time, retrieval_time, 
        negotiated_value, advance_fee, status_payment, id
      ];

      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Pedido não encontrado.' });
        return;
      }

      res.status(200).json({ message: 'Pedido atualizado com sucesso!', order: result.rows[0] });
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      res.status(500).json({ message: 'Erro interno ao atualizar pedido.' });
    }
  }

  // 4. Deletar um Pedido (Delete)
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Pedido não encontrado.' });
        return;
      }

      res.status(200).json({ message: 'Pedido excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      res.status(500).json({ message: 'Erro interno ao excluir pedido.' });
    }
  }
}