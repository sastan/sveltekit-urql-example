<script context="module">
	// Can be read from query as well
	const PAGE_SIZE = 2;

	export async function load({ page, context }) {
		const after = page.query.get('after');
		const before = page.query.get('before');

		return {
			props: {
				result: await context.query(
					// String or TypedDocument or ...
					`query allFilms($first: Int, $after: String, $last: Int, $before: String) {
            allFilms (first: $first, after: $after, last: $last, before: $before) {
              films { id title }
              pageInfo {
                hasPreviousPage
                startCursor
                hasNextPage
                endCursor
              }
            }
          }`,
					{
						first: (after || !before) && PAGE_SIZE,
						after,
						last: before && PAGE_SIZE,
						before
					},
					(data) => data.allFilms
				)
			}
		};
	}
</script>

<script>
	import { query } from '@urql/svelte';

	/**
	 * @type {import('@urql/svelte').OperationStore}
	 */
	export let result;
	// Setup subscription for the lifetime of the component
	query(result);
</script>

<svelte:head>
	<title>Star Wars Films</title>
</svelte:head>

<main>
	<div role="status">
		{#if $result.error}
			<p>Oh no... {$result.error}</p>
		{:else if !$result.data?.films?.length}
			{#if $result.fetching}
				<p>Loading...</p>
			{:else}
				<p>Oh no... no results</p>
			{/if}
		{/if}
	</div>

	{#if $result.data?.films?.length}
		<ul>
			{#each $result.data?.films as film (film.id)}
				<li>{film.title}</li>
			{/each}
		</ul>
	{/if}

	{#if $result.data?.pageInfo?.hasPreviousPage}
		<a
			href={'/?' +
				new URLSearchParams({ last: String(PAGE_SIZE), before: $result.data.pageInfo.startCursor })}
			sveltekit:prefetch>previous page</a
		>
	{/if}

	{#if $result.data?.pageInfo?.hasNextPage}
		<a
			href={'/?' +
				new URLSearchParams({ first: String(PAGE_SIZE), after: $result.data.pageInfo.endCursor })}
			sveltekit:prefetch>next page</a
		>
	{/if}
</main>
