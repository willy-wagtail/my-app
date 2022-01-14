<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ url }) => {
		const currentRoute = url.pathname;

		return {
			props: {
				currentRoute
			}
		};
	};
</script>

<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.scss';
	import { fade } from 'svelte/transition';

	export let currentRoute: string;
</script>

<Header />

{#key currentRoute}
	<main in:fade={{ duration: 2000, delay: 150 }} out:fade={{ duration: 150 }}>
		<slot />
	</main>
{/key}

<footer>Hello, I'm the footer.</footer>
