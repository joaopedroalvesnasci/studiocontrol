import { createClient } from '@/lib/supabase/client'

/** Limite do bucket: 5 MB por arquivo. */
export const TAMANHO_MAXIMO = 5 * 1024 * 1024

/**
 * Envia a imagem de referência para o bucket "referencias".
 * O arquivo vai para uma pasta com o ID do tatuador, que é o que as
 * políticas de RLS do Storage exigem. O nome é aleatório para ninguém
 * conseguir adivinhar o endereço de uma imagem alheia.
 */
export async function enviarReferencia(arquivo: File, userId: string) {
  const supabase = createClient()

  const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const aleatorio = Math.random().toString(36).slice(2, 8)
  const caminho = `${userId}/${Date.now()}-${aleatorio}.${extensao}`

  const { error } = await supabase.storage
    .from('referencias')
    .upload(caminho, arquivo)

  if (error) throw error

  const { data } = supabase.storage.from('referencias').getPublicUrl(caminho)
  return data.publicUrl
}
