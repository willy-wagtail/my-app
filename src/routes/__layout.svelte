<script lang="ts">
	import '../app.scss';
</script>

<div class="max-w-7xl mx-auto">
	<header class="px-6 py-4 border-b flex font-medium text-lg">
		<h1 class="text-center">
			<a
				href="/"
				class=" text-slate-700 hover:text-blue-600 focus:outline-blue-600"
				aria-label="Home"
			>
				<span aria-hidden="true"> williamcheung </span>
			</a>
		</h1>

		<nav class="ml-auto text-slate-700">
			<ul class="flex">
				<li>
					<a
						href="/"
						class="border-b focus:border-b-0 border-blue-600 mr-4 hover:text-blue-600 focus:outline-blue-600"
					>
						notes
					</a>
				</li>

				<li>
					<a
						href="about"
						class="border-b focus:border-b-0 border-blue-600 hover:text-blue-600 focus:outline-blue-600"
					>
						about
					</a>
				</li>
			</ul>
		</nav>
	</header>

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
