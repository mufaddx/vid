import { NextResponse, type NextRequest } from "next/server";

// Server Components have no direct way to read the current pathname —
// this proxy (Next.js 16's renamed middleware.js convention) stamps it
// onto a request header so the protected admin layout
// (src/app/admin/(protected)/layout.tsx) can read it via headers() and
// enforce role-based module access (see src/lib/permissions.ts). No
// session/DB lookup happens here — that stays in the layout, which runs
// in the Node.js runtime and already owns the getSession() call.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
