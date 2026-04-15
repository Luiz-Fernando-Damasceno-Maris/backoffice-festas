import { Request, Response } from 'express';
import pool from '../config/db';

export class KitController {
  async create(req: Request, res: Response): Promise<void> {
    const { name, base_price, total_quantity, item_ids } = req.body;
    
    // Conectamos um cliente exclusivo para garantir a transação
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // Inicia a transação de segurança

      // 1. Cria o Kit
      const kitResult = await client.query(
        'INSERT INTO kits (name, base_price, total_quantity) VALUES ($1, $2, $3) RETURNING *',
        [name, base_price, total_quantity]
      );
      const kit = kitResult.rows[0];

      // 2. Associa os Itens ao Kit (M:N)
      if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
        for (const itemId of item_ids) {
          await client.query(
            'INSERT INTO kit_items (kit_id, item_id) VALUES ($1, $2)',
            [kit.id, itemId]
          );
        }
      }

      await client.query('COMMIT'); // Se chegou até aqui, salva tudo definitivamente!
      
      res.status(201).json({ message: 'Kit montado com sucesso!', kit });
    } catch (error) {
      await client.query('ROLLBACK'); // Se deu qualquer erro no meio, desfaz tudo!
      console.error('Erro na transação do Kit:', error);
      res.status(500).json({ message: 'Erro interno ao montar kit.' });
    } finally {
      client.release(); // Devolve o cliente para a "piscina" de conexões
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      // Usamos JSON_AGG para trazer o Kit já com a lista de itens embutida num único retorno
      const query = `
        SELECT 
          k.*,
          COALESCE(
            json_agg(
              json_build_object('id', i.id, 'name', i.name, 'replacement_value', i.replacement_value)
            ) FILTER (WHERE i.id IS NOT NULL), '[]'
          ) as items
        FROM kits k
        LEFT JOIN kit_items ki ON k.id = ki.kit_id
        LEFT JOIN items i ON ki.item_id = i.id
        GROUP BY k.id
        ORDER BY k.created_at DESC;
      `;
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar kits.' });
    }
  }
  // 3. Atualizar um Kit (Update com Transação)
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, base_price, total_quantity, item_ids } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // Inicia a transação

      // 1. Atualiza os dados base do Kit
      const kitResult = await client.query(
        'UPDATE kits SET name = $1, base_price = $2, total_quantity = $3 WHERE id = $4 RETURNING *',
        [name, base_price, total_quantity, id]
      );

      if (kitResult.rowCount === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ message: 'Kit não encontrado.' });
        return;
      }

      const kit = kitResult.rows[0];

      // 2. Se o Front-end mandou uma nova lista de peças (item_ids)
      if (item_ids && Array.isArray(item_ids)) {
        // Apaga as associações antigas deste kit
        await client.query('DELETE FROM kit_items WHERE kit_id = $1', [id]);
        
        // Insere as novas associações
        for (const itemId of item_ids) {
          await client.query(
            'INSERT INTO kit_items (kit_id, item_id) VALUES ($1, $2)',
            [id, itemId]
          );
        }
      }

      await client.query('COMMIT'); // Salva tudo
      res.status(200).json({ message: 'Kit atualizado com sucesso!', kit });

    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz se der erro
      console.error('Erro ao atualizar kit:', error);
      res.status(500).json({ message: 'Erro interno ao atualizar kit.' });
    } finally {
      client.release();
    }
  }

  // 4. Deletar um Kit (Delete)
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      // Como o relacionamento em kit_items é ON DELETE CASCADE (que definimos no SQL),
      // ao deletar o kit, o banco já limpa a tabela de ligação automaticamente!
      const result = await pool.query('DELETE FROM kits WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Kit não encontrado.' });
        return;
      }

      res.status(200).json({ message: 'Kit excluído com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao excluir kit:', error);
      
      // Bloqueio de proteção se o kit estiver num Pedido
      if (error.code === '23503') {
        res.status(400).json({ 
          message: 'Ação bloqueada: Este kit não pode ser excluído pois já está atrelado a um pedido/contrato.' 
        });
      } else {
        res.status(500).json({ message: 'Erro interno ao excluir kit.' });
      }
    }
  }
}