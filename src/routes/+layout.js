// Client-only SPA: state lives in localStorage and the UI is a single
// stateful screen, so there is nothing meaningful to server-render.
export const ssr = false;
export const prerender = true;
