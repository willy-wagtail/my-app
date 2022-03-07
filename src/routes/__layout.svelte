<script lang="ts">
	import '../app.scss';
</script>

<svelte:head>
	<meta property="og:site_name" content="William Cheung" />
	<meta property="og:locale" content="en_GB" />

	<!-- <meta name="twitter:creator" content="@xxx" />
	<meta name="twitter:site" content="@xxx" />
	<meta name="twitter:card" content="summary_large_image" /> -->
</svelte:head>

<div class="max-w-7xl mx-auto">
	<header
		class="sticky top-0 backdrop-blur-md bg-white/30 px-6 py-4 border-b flex font-medium text-lg"
	>
		<div class="text-center">
			<a
				href="/"
				class=" text-slate-700 focus:outline-blue-600 hover:text-blue-600"
				aria-label="Home"
			>
				<span aria-hidden="true">williamcheung</span>
			</a>
		</div>

		<nav class="ml-auto text-slate-700">
			<ul class="flex">
				<li>
					<a href="/notes" class="mr-4 app-link"> Notes </a>
				</li>
			</ul>
		</nav>
	</header>

	<main class="max-w-3xl xl:max-w-5xl px-6 pb-28 mx-auto">
		<slot />
	</main>
</div>
