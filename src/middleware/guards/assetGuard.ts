/**
 * Asset Guard — identify static files and assets that should bypass authentication middleware
 */
export function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon.') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|js|css|woff2?|json|xml|map)$/) !== null
  );
}
