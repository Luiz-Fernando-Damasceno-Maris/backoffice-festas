import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias no .env');
}

// Cliente Supabase com a Service Role Key para operações de Storage no servidor
export const supabase = createClient(supabaseUrl, supabaseKey);
