const sveltePreprocess = require('svelte-preprocess');
const node = require('@sveltejs/adapter-node');
const pkg = require('./package.json');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess(),

	kit: {
		// By default, `npm run build` will create a standard Node app.
		// You can create optimized builds for different platforms by
		// specifying a different adapter
		adapter: node(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: {
			resolve: {
				dedupe: ['svelte', 'urql']
			},
			optimizeDeps: {
				exclude: Object.keys(pkg.dependencies || {}).filter((d) => !['graphql'].includes(d)),
				include: ['graphql']
			},
			ssr: {
				// Until https://github.com/vitejs/vite/issues/2579
				noExternal: Object.keys(pkg.dependencies || {})
			}
		}
	}
};
