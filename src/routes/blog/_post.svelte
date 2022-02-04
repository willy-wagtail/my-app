<script>
	/** @type {string} */
	export let title;

	/** @type {string} */
	export let date;

	/** @type {string[]} */
	export let categories;
</script>

<svelte:head>
	<title>My blog - {title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<h1>{title}</h1>

<p>Published: {date}</p>

<slot />

{#if categories.length}
	<aside>
		<h2>Posted in:</h2>
		<ul>
			{#each categories as category}
				<li>
					<a href="/blog/categories/{category}">
						{category}
					</a>
				</li>
			{/each}
		</ul>
	</aside>
{:else}
	<p>Else block</p>
{/if}
