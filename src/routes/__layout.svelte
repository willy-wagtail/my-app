<script lang="ts">
	import '../app.scss';
	import Header from '$lib/components/Header.svelte';
</script>

<div class="max-w-7xl mx-auto">
	<Header className="px-6 py-4 font-medium flex border-b" />

	<main class="max-w-5xl px-6 mx-auto">
		<slot />
	</main>

	<!-- <footer>
		<ul>
			<li><a href="about">Notes</a></li>
			<li><a href="about">About</a></li>
		</ul>
	</footer> -->
</div>
