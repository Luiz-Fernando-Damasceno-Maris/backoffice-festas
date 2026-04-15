import { Request, Response } from 'express';
import pool from '../config/db';

export class ItemController {
  async create(req: Request, res: Response): Promise<void> {
    const { name, replacement_value } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO items (name, replacement_value) VALUES ($1, $2) RETURNING *',
        [name, replacement_value]
      );
      res.status(201).json({ message: 'Item cadastrado!', item: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar item.' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query('SELECT * FROM items ORDER BY name ASC');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar itens.' });
    }
  }
  // 3. Atualizar um item (Update)
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, replacement_value } = req.body;

    try {
      const result = await pool.query(
        'UPDATE items SET name = $1, replacement_value = $2 WHERE id = $3 RETURNING *',
        [name, replacement_value, id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Item não encontrado.' });
        return;
      }

      res.status(200).json({ message: 'Item atualizado com sucesso!', item: result.rows[0] });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      res.status(500).json({ message: 'Erro interno ao atualizar item.' });
    }
  }

  // 4. Deletar um item (Delete)
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM items WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Item não encontrado.' });
        return;
      }

      res.status(200).json({ message: 'Item excluído com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      
      // 23503 é o código do Postgres para "Violação de Chave Estrangeira"
      // Ele entra aqui se o Item já estiver sendo usado em algum Kit!
      if (error.code === '23503') {
        res.status(400).json({ 
          message: 'Ação bloqueada: Este item não pode ser excluído pois já faz parte de um Kit montado.' 
        });
      } else {
        res.status(500).json({ message: 'Erro interno ao excluir item.' });
      }
    }
  }
}