<script lang="ts">
	import '../app.scss';
</script>

<div class="max-w-7xl mx-auto">
	<header
		class="sticky top-0 backdrop-blur-md bg-white/30 px-6 py-4 border-b flex font-medium text-lg"
	>
		<div class="text-center">
			<a
				href="/"
				class=" text-slate-700 hover:text-blue-600 focus:outline-blue-600"
				aria-label="Home"
			>
				<span aria-hidden="true">williamcheung</span>
			</a>
		</div>

		<nav class="ml-auto text-slate-700">
			<ul class="flex">
				<li>
					<a
						href="/notes"
						class="border-b focus:border-b-0 border-blue-600 mr-4 hover:text-blue-600 focus:outline-blue-600"
					>
						notes
					</a>
				</li>

				<li>
					<a
						href="/about"
						class="border-b focus:border-b-0 border-blue-600 hover:text-blue-600 focus:outline-blue-600"
					>
						about
					</a>
				</li>
			</ul>
		</nav>
	</header>

	<main class="max-w-5xl px-6 pb-28 mx-auto">
		<slot />
	</main>
</div>
