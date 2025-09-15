import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Handle CORS for Replit environment
  const origin = request.headers.get('origin')
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  const allowedOrigins = isDevelopment ? [
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
    /^https?:\/\/.*\.replit\.(dev|app)$/,
  ] : [
    // In production, restrict to specific domains only
    // Add your production domain here when deploying
  ]

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if origin is allowed
  if (origin) {
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin))
    if (isAllowed) {
      supabaseResponse.headers.set('Access-Control-Allow-Origin', origin)
      supabaseResponse.headers.set('Access-Control-Allow-Credentials', 'true')
      supabaseResponse.headers.set('Vary', 'Origin')
    }
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const isAllowed = origin && allowedOrigins.some(pattern => pattern.test(origin))
    if (isAllowed) {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Supabase-Authorization, apikey, Range',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      })
    } else {
      return new Response(null, { status: 403 })
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh session if expired - this is required for the Supabase auth to work properly
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
