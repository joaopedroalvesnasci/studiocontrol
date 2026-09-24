import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Páginas que podem ser abertas sem estar logado. */
const ROTAS_PUBLICAS = ['/login', '/cadastro']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const caminho = request.nextUrl.pathname
  const ehPublica = ROTAS_PUBLICAS.some((rota) => caminho.startsWith(rota))

  // Sem sessão tentando abrir uma página protegida: vai para o login.
  if (!user && !ehPublica && caminho !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Já logado tentando abrir login ou cadastro: vai para o painel.
  if (user && ehPublica) {
    return NextResponse.redirect(new URL('/painel', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)',
  ],
}
