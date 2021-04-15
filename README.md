# Sveltekit urql Example

## Important Changes

- [svelte.config.cjs](./svelte.config.cjs) – adjusted vite config
- [src/lib/graphql/client.ts](./src/lib/graphql/client.ts) – create urql client
- [src/routes/$layout.svelte](./src/routes/$layout.svelte) – initialize urql client and add query method to context
- [src/routes/index.svelte](./src/routes/index.svelte) – using `context.query`
