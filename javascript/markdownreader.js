/*
 * Mutantcat Web Markdown Reader
 * - 支持通过 ?url=（远程 Markdown 地址）或 ?base64=（Markdown 文本的 Base64 编码）加载
 * - 使用 marked 渲染，并套用 GitHub Markdown 样式
 * - 相对资源链接在 ?url= 模式下可通过 <base> 自动相对解析
 */

(function () {
	const app = document.getElementById('app');
	const defaultTitle = document.title || 'Mutantcat Web Markdown Reader';

	if (!app) {
		console.error('#app container not found.');
		return;
	}

	// Configure marked
	if (typeof marked !== 'undefined') {
		marked.setOptions({
			gfm: true,
			breaks: false,
			headerIds: true,
			mangle: false,
		});
	} else {
		renderError('未找到 Markdown 解析器', '请确认已正确加载 javascript/marked.min.js');
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const urlParam = params.get('url');
	const b64Param = params.get('base64');
	const titleParam = params.get('title');

	// 优先使用 url，其次 base64
	if (urlParam) {
		try {
			const abs = absoluteUrl(urlParam);
			setBaseHref(directoryOf(abs));
			renderLoading('正在从远程加载 Markdown …');
			fetchMarkdown(abs)
				.then((md) => renderMarkdown(md))
				.catch((e) => {
					renderError('加载失败',
						`无法从该地址获取 Markdown 内容：\n${abs}\n\n可能原因：\n- 该地址不可访问或返回了错误\n- 目标服务器未允许跨域（CORS）访问\n\n建议：\n- 使用允许 CORS 的原始文件地址（如 GitHub raw）\n- 或将 Markdown 文本以 base64 形式通过 ?base64= 传入`, e);
				});
		} catch (err) {
			renderError('URL 无效', String(err));
		}
	} else if (b64Param) {
		try {
			const md = decodeBase64Utf8(b64Param);
			clearBaseHref();
			renderMarkdown(md);
		} catch (err) {
			renderError('Base64 解码失败', String(err));
		}
	} else {
		showWelcome();
	}

	// -------- helpers --------

	function renderLoading(text) {
		app.innerHTML = `<p><em>${escapeHtml(text || 'Loading…')}</em></p>`;
	}

	function renderMarkdown(markdown) {
		try {
			const html = marked.parse(markdown);
			app.innerHTML = html;
			// 解析完再设置标题：优先参数，其次第一条标题
			if (titleParam) {
				document.title = titleParam;
			} else {
				const heading = app.querySelector('h1, h2, h3, h4, h5, h6');
				if (heading && heading.textContent) {
					document.title = heading.textContent.trim();
				} else {
					document.title = defaultTitle;
				}
			}
		} catch (err) {
			renderError('渲染失败', String(err));
		}
	}

	async function fetchMarkdown(url) {
		const res = await fetch(url, {
			// 允许默认 CORS 策略；某些服务器如 GitHub raw 支持跨域
			headers: {
				'Accept': 'text/markdown, text/plain, text/*;q=0.9, */*;q=0.8'
			}
		});
		if (!res.ok) {
			throw new Error(`HTTP ${res.status} ${res.statusText}`);
		}
		return await res.text();
	}

	function absoluteUrl(input) {
		return new URL(input, window.location.href).href;
	}

	function directoryOf(href) {
		const u = new URL(href);
		// remove filename part
		u.pathname = u.pathname.replace(/[^/]*$/, '');
		u.search = '';
		u.hash = '';
		return u.href;
	}

	function setBaseHref(href) {
		// 设定相对链接的基准路径，以便图片/链接按远程目录解析
		let base = document.querySelector('head base');
		if (!base) {
			base = document.createElement('base');
			document.head.prepend(base);
		}
		base.href = href;
	}

	function clearBaseHref() {
		const base = document.querySelector('head base');
		if (base) base.remove();
	}

		function decodeBase64Utf8(b64) {
			// 规范化：处理 URL 中的 + 被当作空格、URL-safe 字符，以及行内空白与 padding
			let s = (b64 || '').trim();
			// 将解析出来的空格还原为 '+'（许多环境会把 + 当作空格）
			s = s.replace(/ /g, '+');
			// URL-safe -> 标准 Base64
			s = s.replace(/-/g, '+').replace(/_/g, '/');
			// 去除换行和制表符
			s = s.replace(/[\r\n\t]/g, '');
			// 自动补齐 padding
			const pad = s.length % 4;
			if (pad) s += '='.repeat(4 - pad);

			// atob -> bytes
			const bin = atob(s);
			const bytes = new Uint8Array(bin.length);
			for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

			// 优先严格按 UTF-8 解码，失败则尝试常见中文编码，再退回容错方案
			try {
				return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
			} catch (_) {
				// 部分内容可能是 GBK/GB18030 编码
				try {
					// 先尝试 gbk，不行再尝试 gb18030
					return new TextDecoder('gbk', { fatal: false }).decode(bytes);
				} catch (__){
					try {
						return new TextDecoder('gb18030', { fatal: false }).decode(bytes);
					} catch (___) {
						// 最后回退
						return decodeURIComponent(escape(bin));
					}
				}
			}
		}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function showWelcome() {
		clearBaseHref();
			const sampleMd = [
			'# 欢迎使用 Markdown 预览器',
			'',
			'通过以下两种方式打开 Markdown：',
			'',
				'1. 远程地址：`?url=https://raw.githubusercontent.com/user/repo/README.md`',
				'2. Base64 文本：`?base64=...`（UTF-8 编码；如含 `+`/`/`，请进行 URL 编码，或改用 URL-safe `-`/`_`）',
			'',
			'小提示：若远程地址跨域受限（CORS），请改用允许跨域的原始文件地址或使用 base64 方式。',
            '',
            '本服务由 [Mutantcat](https://mutantcat.github.io/) 提供。',
		].join('\n');

		const html = marked.parse(sampleMd);
		app.innerHTML = `
			${html}
			<hr>
			<p><strong>本地文件试用（可选）：</strong></p>
			<input id="fileInput" type="file" accept=".md,.markdown,.txt" aria-label="选择本地 Markdown 文件">
		`;

		const fileInput = document.getElementById('fileInput');
		fileInput?.addEventListener('change', async (e) => {
			const f = e.target.files && e.target.files[0];
			if (!f) return;
			document.title = f.name || defaultTitle;
			try {
				const text = await f.text();
				renderMarkdown(text);
			} catch (err) {
				renderError('读取本地文件失败', String(err));
			}
		});

		document.title = defaultTitle;
	}

	function renderError(title, message, errorObj) {
		const details = errorObj ? `\n\n详情: ${escapeHtml(errorObj.message || String(errorObj))}` : '';
		app.innerHTML = `
			<h2>${escapeHtml(title)}</h2>
			<pre><code>${escapeHtml(message)}${details}</code></pre>
		`;
		document.title = `${title} · ${defaultTitle}`;
	}
})();

