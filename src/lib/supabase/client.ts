import { createBrowserClient } from '@supabase/ssr'

/**
 * Conexão com o Supabase usada em componentes do navegador
 * (arquivos marcados com 'use client').
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
