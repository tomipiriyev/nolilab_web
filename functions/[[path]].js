// The repo root is the deploy, so Cloudflare would serve developer files too.
// _routes.json sends only those paths here, and they get the site's normal 404 page.
export const onRequest = ({ request, env }) =>
  env.ASSETS.fetch(new URL('/__not-found__', request.url));
