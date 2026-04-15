import pool from '../config/db';
import bcrypt from 'bcrypt';

async function createAdmin() {
  // SUAS CREDENCIAIS DE ACESSO AO SISTEMA
  const email = 'admin@exemplo.com'; 
  const senha = 'SenhaForte123'; 

  try {
    console.log('Gerando hash da senha...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(senha, saltRounds);

    console.log('Inserindo admin no banco de dados...');
    const query = `
      INSERT INTO admins (email, password_hash) 
      VALUES ($1, $2) 
      RETURNING id, email;
    `;
    
    const result = await pool.query(query, [email, passwordHash]);
    
    console.log('✅ Administrador criado com sucesso!');
    console.log(result.rows[0]);
    
  } catch (error: any) {
    // Se o email já existir, ele vai dar erro de duplicidade (o que é esperado)
    if (error.code === '23505') {
      console.log('⚠️ Este email de administrador já existe no banco.');
    } else {
      console.error('❌ Erro ao criar admin:', error);
    }
  } finally {
    // Fecha a conexão com o banco para o script não ficar travado no terminal
    pool.end();
  }
}

createAdmin();