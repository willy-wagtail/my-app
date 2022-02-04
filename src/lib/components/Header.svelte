<script lang="ts">
	export let className: string = '';
</script>

<header class={className}>
	<h1>
		<a
			href="/"
			class="py-2 px-4 text-slate-700 hover:text-blue-600 focus:outline-blue-600"
			aria-label="Home"
		>
			<span aria-hidden="true"> williamcheung </span>
		</a>
	</h1>

	<nav class="ml-auto text-slate-700">
		<ul class="flex">
			<li>
				<a href="about" class="py-2 px-4 hover:text-blue-600 focus:outline-blue-600"> notes </a>
			</li>

			<li>
				<a href="about" class="py-2 px-4 hover:text-blue-600 focus:outline-blue-600"> about </a>
			</li>
		</ul>
	</nav>
</header>
