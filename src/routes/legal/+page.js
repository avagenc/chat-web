// Legal pages are static content that Google's OAuth verifier must be able
// to crawl, so we opt back into SSR/prerender (the root layout sets ssr=false
// for the client-only chat app).
export const ssr = true;
export const prerender = true;
