import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';

// /** @type {import('vite').Plugin} */
// const viteServerConfig = {
// 	name: 'log-request-middleware',
// 	configureServer(server) {
// 		server.middlewares.use((req, res, next) => {
// 			res.setHeader('Access-Control-Allow-Origin', '*');
// 			res.setHeader('Access-Control-Allow-Methods', 'GET');
// 			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
// 			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
// 			next();
// 		});
// 	}
// };

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.jsep.*',

					dest: 'wasm'
				}
			]
		})
	],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			external: ['path', 'fs', 'url', 'source-map-js']
		}
	},
	worker: {
		format: 'es'
	},
	optimizeDeps: {
		include: [
			'socket.io-client',
			'svelte-sonner',
			'idb',
			'file-saver',
			'mermaid',
			'dompurify',
			'marked',
			'yaml',
			'uuid',
			'js-sha256',
			'dayjs',
			'dayjs/plugin/relativeTime',
			'dayjs/plugin/isToday',
			'dayjs/plugin/isYesterday',
			'dayjs/plugin/localizedFormat',
			'highlight.js',
			'svelte-confetti',
			'tippy.js',
			'i18next',
			'i18next-resources-to-backend',
			'i18next-browser-languagedetector',
			'katex',
			'focus-trap',
			'bits-ui',
			'kokoro-js',
			'@huggingface/transformers',
			'sortablejs',
			'fuse.js',
			'panzoom',
			'codemirror',
			'@codemirror/view',
			'@codemirror/state',
			'@codemirror/autocomplete',
			'@codemirror/commands',
			'@codemirror/language',
			'@codemirror/language-data',
			'@codemirror/theme-one-dark',
			'codemirror-lang-hcl',
			'codemirror-lang-elixir',
			'katex/contrib/mhchem'
		]
	},
	server: {
		fs: {
			allow: [
				'.',
				'../node_modules',
				'./static'
			]
		}
	}
});
