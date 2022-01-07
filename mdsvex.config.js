const config = {
	extensions: ['.svelte.md', '.md', '.svx'],

	layout: {
		blog: 'src/routes/blog/_post.svelte'
	},

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [],
	rehypePlugins: []
};

export default config;
