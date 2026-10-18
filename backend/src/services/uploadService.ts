import { supabase } from '../config/supabaseClient';
import crypto from 'crypto';
import path from 'path';

const BUCKET_NAME = 'kits';

/**
 * Faz upload de um ficheiro (buffer) para o Supabase Storage e devolve o URL público.
 * Gera um nome único com UUID para evitar colisões.
 */
export async function uploadImageToStorage(
  fileBuffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<string> {
  // Gera nome único: uuid + extensão original
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const fileName = `${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType: mimetype,
      upsert: false, // Não sobrescrever ficheiros existentes
    });

  if (error) {
    console.error('❌ Erro no upload para Supabase Storage:', error);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }

  // Extrai o URL público da imagem
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Remove uma imagem do Supabase Storage pelo URL público.
 * Extrai o nome do ficheiro a partir do URL.
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // O URL público segue o padrão: .../storage/v1/object/public/kits/FILENAME
    const urlParts = imageUrl.split(`/${BUCKET_NAME}/`);
    if (urlParts.length < 2) return; // URL inválido, ignora silenciosamente

    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('⚠️ Erro ao remover imagem do Storage:', error);
      // Não lança erro — a remoção da imagem é best-effort
    }
  } catch (err) {
    console.error('⚠️ Erro inesperado ao remover imagem:', err);
  }
}
