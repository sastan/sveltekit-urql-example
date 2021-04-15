<script context="module">
	import { get, readable } from 'svelte/store';
	import { operationStore } from '@urql/svelte';
	import { browser, dev } from '$app/env';
	import { createClient } from '$lib/graphql';

	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ fetch, context }) {
		const client = await createClient({
			url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
			// Pass in the fetch from sveltekit to have access to serialized requests during hydration
			fetch,
			dev: browser && dev
		});
		return {
			context: {
				...context,
				client,
				// Works just like query from @urql/svelte
				query: async (query, variables, context, normalize) => {
					if (typeof variables == 'function') {
						[normalize, variables, context] = [variables];
					} else if (typeof context == 'function') {
						[normalize, context] = [context];
					}

					const store = operationStore(query, variables, context);
					const result = await client
						.query(store.query, store.variables, store.context)
						.toPromise();
					Object.assign(get(store), result);

					if (normalize) {
						const { subscribe } = store;

						return Object.create(store, {
							subscribe: {
								enumerable: true,
								value: readable(store, (set) => {
									const unsubscribe = subscribe((result) => {
										if (result.data) {
											Object.assign(result.data, normalize(result.data, result));
										}
										set(result);
									});

									return unsubscribe;
								}).subscribe
							}
						});
					}

					return store;
				}
			},
			props: { client }
		};
	}
</script>

<script>
	import { setClient } from '@urql/svelte';

	/**
	 * @type {import('@urql/svelte').Client}
	 */
	export let client;
	setClient(client);
</script>

<slot />
