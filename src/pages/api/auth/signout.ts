import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear Clerk session cookies if any are present
  cookies.delete('__session', { path: '/' });
  cookies.delete('__clerk_db_jwt', { path: '/' });
  return redirect('/', 302);
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('__session', { path: '/' });
  cookies.delete('__clerk_db_jwt', { path: '/' });
  return redirect('/', 302);
};
