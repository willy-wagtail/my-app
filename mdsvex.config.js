import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const config = {
	extensions: ['.svelte.md', '.md', '.svx'],

	// https://mdsvex.pngwn.io/docs/#layouts
	layout: {
		blog: 'src/routes/blog/_post.svelte'
	},

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [],

	rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
};

export default config;
