import multer from 'multer';

// Configuração do Multer para guardar ficheiros em memória (buffer)
// Ideal para depois enviar diretamente ao Supabase Storage sem escrever em disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite: 5MB por imagem
  },
  fileFilter: (_req, file, cb) => {
    // Só aceita imagens (JPEG, PNG, WebP, GIF)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de ficheiro não permitido. Envie apenas imagens (JPEG, PNG, WebP ou GIF).'));
    }
  },
});

export default upload;
