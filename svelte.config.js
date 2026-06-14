import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-node → produces build/index.js, a Node/Bun server that listens
		// on $PORT. Matches the Dockerfile (CMD ["build/index.js"], PORT=8080)
		// and runs on Cloud Run. Frontend will call the backend over HTTP/API.
		adapter: adapter()
	}
};

export default config;
