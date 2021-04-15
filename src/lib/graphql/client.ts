import type { Client, ClientOptions } from '@urql/svelte';
import {
	createClient as _createClient,
	dedupExchange,
	errorExchange,
	cacheExchange,
	fetchExchange
} from '@urql/svelte';
import { requestPolicyExchange } from '@urql/exchange-request-policy';

export type { Client };

export async function createClient({
	dev,
	...options
}: ClientOptions & { dev: boolean }): Promise<Client> {
	const exchanges = [
		dedupExchange,
		dev &&
			errorExchange({
				onError(error, operation) {
					console.error('GraphQL error:', { error, operation });
				}
			}),
		// conditionally upgrade cache-first and cache-only operations to use cache-and-network,
		// so that the client gets an opportunity to update its cached data, when the operation
		// hasn't been seen within the given ttl time.
		requestPolicyExchange({
			// 3 minutes
			ttl: 3 * 60 * 1000
		}),
		cacheExchange,
		fetchExchange
	];

	if (dev) {
		const { devtoolsExchange } = await import('@urql/devtools');
		exchanges.unshift(devtoolsExchange);
	}

	return _createClient({ ...options, exchanges: exchanges.filter(Boolean) });
}
