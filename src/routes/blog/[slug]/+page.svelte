<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import type { PageData } from './$types';
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import bash from 'highlight.js/lib/languages/bash';
	import json from 'highlight.js/lib/languages/json';
	import xml from 'highlight.js/lib/languages/xml';
	import css from 'highlight.js/lib/languages/css';
	import python from 'highlight.js/lib/languages/python';
	import lean from '$lib/highlight/lean';
	import { typesetMath } from '$lib/math/mathjax';

	const { data } = $props<{ data: PageData }>();
	const { post } = data;
	const isBrowser = typeof window !== 'undefined';
	const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
	const formattedDate = dateFormatter.format(new Date(post.published));
	let tocEntries = $state<Array<{ id: string; label: string; level: number }>>([]);
	let tocOpen = $state(false);
	let activeHeadingId = $state<string | null>(null);
	let tocElement = $state<HTMLElement | null>(null);
	let headingElements: HTMLElement[] = [];
	let clickHandler: ((event: MouseEvent) => void) | null = null;
	let mediaQuery: MediaQueryList | null = null;
	let mediaQueryListener: ((event: MediaQueryListEvent) => void) | null = null;
	let scrollHandler: (() => void) | null = null;
	let resizeHandler: (() => void) | null = null;
	let rafId: number | null = null;
	let mathReady = $state(!isBrowser);

	const languages = {
		javascript,
		typescript,
		bash,
		json,
		xml,
		css,
		python,
		lean
	};

	Object.entries(languages).forEach(([name, language]) => {
		if (!hljs.getLanguage(name)) {
			hljs.registerLanguage(name, language);
		}
	});

	function slugifyHeading(text: string) {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function updateActiveHeading() {
		if (typeof window === 'undefined' || headingElements.length === 0) return;
		const targetY = window.scrollY + window.innerHeight * 0.18;
		let current = headingElements[0]?.id ?? null;
		for (const heading of headingElements) {
			if (heading.offsetTop <= targetY) {
				current = heading.id;
			} else {
				break;
			}
		}
		activeHeadingId = current;
	}

	function scheduleHeadingUpdate() {
		if (typeof window === 'undefined') return;
		if (rafId !== null) return;
		rafId = window.requestAnimationFrame(() => {
			rafId = null;
			updateActiveHeading();
		});
	}

	function buildTableOfContents(postBody: HTMLElement) {
		headingElements = Array.from(postBody.querySelectorAll<HTMLElement>('h2, h3, h4'));
		const slugCounts = new Map<string, number>();
		tocEntries = headingElements.map((heading) => {
			const rawText = heading.textContent?.trim() ?? 'Section';
			let id = heading.id?.trim();
			if (!id) {
				const base = slugifyHeading(rawText) || 'section';
				const count = slugCounts.get(base) ?? 0;
				slugCounts.set(base, count + 1);
				id = count ? `${base}-${count}` : base;
				heading.id = id;
			}
			return { id, label: rawText, level: Number(heading.tagName.replace('H', '')) };
		});

		scheduleHeadingUpdate();
	}

	onMount(() => {
		const blocks = document.querySelectorAll<HTMLPreElement>('.post-body pre');
		blocks.forEach((pre) => {
			if (pre.dataset.enhanced === 'true') return;
			const codeEl = pre.querySelector<HTMLElement>('code');
			if (!codeEl) return;
			hljs.highlightElement(codeEl);
			attachCopyButton(pre, () => codeEl.textContent ?? '', 'Copy code to clipboard');
			pre.dataset.enhanced = 'true';
		});

		const postBody = document.querySelector<HTMLElement>('.post-body');
		if (postBody) {
			mathReady = false;
			void typesetMath(postBody)
				.then(() => {
					enhanceMathBlocks(postBody);
				})
				.catch((error) => {
					console.error('Error while typesetting math:', error);
				})
				.finally(() => {
					mathReady = true;
				});
			buildTableOfContents(postBody);
		} else {
			mathReady = true;
		}

		if (typeof window !== 'undefined') {
			mediaQuery = window.matchMedia('(min-width: 960px)');
			tocOpen = mediaQuery.matches;
			mediaQueryListener = (event) => {
				tocOpen = event.matches;
			};
			mediaQuery.addEventListener('change', mediaQueryListener);

			scrollHandler = () => scheduleHeadingUpdate();
			resizeHandler = () => scheduleHeadingUpdate();
			window.addEventListener('scroll', scrollHandler, { passive: true });
			window.addEventListener('resize', resizeHandler);
			scheduleHeadingUpdate();
		}

		if (typeof document !== 'undefined') {
			clickHandler = (event) => {
				if (!tocOpen) return;
				if (!tocElement) return;
				const target = event.target as Node | null;
			};
			document.addEventListener('click', clickHandler);
		}
	});

	onDestroy(() => {
		if (rafId !== null && typeof window !== 'undefined') {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}
		if (clickHandler) {
			document.removeEventListener('click', clickHandler);
			clickHandler = null;
		}
		if (mediaQuery && mediaQueryListener) {
			mediaQuery.removeEventListener('change', mediaQueryListener);
			mediaQueryListener = null;
		}
		if (scrollHandler && typeof window !== 'undefined') {
			window.removeEventListener('scroll', scrollHandler);
			scrollHandler = null;
		}
		if (resizeHandler && typeof window !== 'undefined') {
			window.removeEventListener('resize', resizeHandler);
			resizeHandler = null;
		}
	});

	// Icon markup sourced from Lucide (https://lucide.dev/icons/clipboard)
	const clipboardIconSvg = `
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" role="img">
				<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
				<path d="M8 2h8v4H8z" />
			</svg>
		`;

	function createClipboardIcon() {
		const template = document.createElement('template');
		template.innerHTML = clipboardIconSvg.trim();
		return template.content.firstElementChild as SVGElement;
	}

	function attachCopyButton(container: HTMLElement, getValue: () => string, label: string) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'copy-button';
		button.setAttribute('aria-label', label);

		const icon = createClipboardIcon();
		button.appendChild(icon);

		const srText = document.createElement('span');
		srText.className = 'sr-only';
		srText.textContent = label;
		button.appendChild(srText);

		button.addEventListener('click', async () => {
			const value = getValue();
			try {
				await navigator.clipboard.writeText(value);
				button.classList.add('copied');
				srText.textContent = 'Copied';
			} catch (error) {
				srText.textContent = 'Error copying code';
			}

			setTimeout(() => {
				button.classList.remove('copied');
				srText.textContent = label;
			}, 2000);
		});

		container.appendChild(button);
	}

	function enhanceMathBlocks(scope: HTMLElement) {
		const blocks = scope.querySelectorAll<HTMLElement>('.math-block');
		blocks.forEach((block) => {
			if (block.dataset.enhanced === 'true') return;
			const tex = block.dataset.texSource?.trim();
			if (!tex) return;
			attachCopyButton(block, () => block.dataset.texSource ?? '', 'Copy LaTeX to clipboard');
			block.dataset.enhanced = 'true';
		});
	}
</script>

<div class="blog-layout" style="background-color: var(--bg-page); color: var(--text-base);">
	<AppHeader />
	<main class="post-main" style="background-color: var(--bg-main);">
		<div class="post-shell">
			<article class="post-article">
				<a class="back-link" href="/blog">← Back to all posts</a>
				<p class="post-date">{formattedDate}</p>
				<h1>{post.title}</h1>
				{#if post.tags.length}
					<ul class="tag-list">
						{#each post.tags as tag}
							<li>{tag}</li>
						{/each}
					</ul>
				{/if}
				<div class="post-body-wrapper">
					{#if !mathReady}
						<div class="post-body-placeholder" role="status" aria-live="polite" aria-busy="true">
							<div class="skeleton-block title"></div>
							<div class="skeleton-line wide"></div>
							<div class="skeleton-line"></div>
							<div class="skeleton-line medium"></div>
							<div class="skeleton-line wide"></div>
							<div class="skeleton-block code"></div>
							<div class="skeleton-line"></div>
							<div class="skeleton-line medium"></div>
						</div>
					{/if}
					<div
						class="post-body"
						aria-live="polite"
						data-ready={mathReady}
						aria-hidden={!mathReady}
					>
						{@html post.html}
					</div>
				</div>
			</article>
			{#if tocEntries.length}
				<aside class="toc-panel" bind:this={tocElement} aria-live="polite" data-open={tocOpen}>
					<button
						class="toc-toggle"
						type="button"
						aria-expanded={tocOpen}
						onclick={() => (tocOpen = !tocOpen)}
					>
						<span>Table of contents</span>
						<span aria-hidden="true">{tocOpen ? '−' : '+'}</span>
						<span class="sr-only">Toggle table of contents visibility</span>
					</button>
					{#if tocOpen}
						<nav aria-label="Table of contents">
							<ol class="toc-list">
								{#each tocEntries as entry}
									<li class={`level-${entry.level}`}>
										<a href={`#${entry.id}`} class:active={tocOpen && entry.id === activeHeadingId}>
											{entry.label}
										</a>
									</li>
								{/each}
							</ol>
						</nav>
					{/if}
				</aside>
			{/if}
		</div>
	</main>
</div>

<style>
	.blog-layout {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.post-main {
		padding: clamp(1.5rem, 3vw, 4rem);
		border-top: 1px solid var(--border-subtle);
	}

	.post-shell {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: stretch;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding-inline: clamp(1rem, 5vw, 2rem);
		box-sizing: border-box;
	}

	.post-article {
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding: clamp(1.25rem, 5vw, 2.5rem);
		border-radius: 0.5rem;
		background: var(--bg-card);
		box-sizing: border-box;
	}

	@media (min-width: 960px) {
		.post-shell {
			flex-direction: row;
			align-items: flex-start;
			justify-content: center;
			gap: clamp(2rem, 3vw, 3rem);
			padding-inline: clamp(2rem, 4vw, 4rem);
		}

		.post-article {
			flex: 1 1 0;
		}

		.toc-panel {
			position: sticky;
			top: 2rem;
			max-height: calc(100vh - 4rem);
			overflow: hidden auto;
			min-width: 220px;
			max-width: 280px;
			width: clamp(220px, 18vw, 280px);
			align-self: flex-start;
			box-sizing: border-box;
			margin: 0;
		}
	}

	.toc-panel {
		background: color-mix(in srgb, var(--bg-card) 92%, transparent);
		border-radius: 0.75rem;
		padding: clamp(0.75rem, 3vw, 1rem);
		width: 100%;
		align-self: stretch;
		margin: 0 auto;
		box-sizing: border-box;
		max-width: 720px;
	}

	.toc-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border: none;
		background: none;
		color: var(--text-strong);
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0;
		cursor: pointer;
	}

	.toc-panel nav {
		margin-top: 0.85rem;
	}

	.toc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.toc-list li {
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.toc-list li.level-3 {
		padding-left: 0.75rem;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--text-base) 85%, transparent);
	}

	.toc-list li.level-4 {
		padding-left: 1.25rem;
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.toc-list a {
		text-decoration: none;
		border: none;
		color: inherit;
		font-weight: 500;
		transition: color 120ms ease;
	}

	.toc-list a:hover,
	.toc-list a:focus-visible {
		color: var(--text-strong);
	}

	.toc-list a.active {
		color: var(--text-strong);
		font-weight: 600;
	}

	.back-link {
		display: inline-flex;
		gap: 0.35rem;
		align-items: center;
		font-size: 0.9rem;
		text-decoration: none;
		color: var(--text-strong);
		margin-bottom: 0.5rem;
		border-bottom: 1px solid transparent;
	}

	.back-link:hover,
	.back-link:focus-visible {
		border-color: currentColor;
	}

	.post-date {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.3em;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	h1 {
		margin: 0.75rem 0 0.5rem;
		font-size: clamp(2rem, 1.8rem + 1vw, 3rem);
		color: var(--text-strong);
	}

	.tag-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem;
		display: flex;
		gap: 0.45rem;
		flex-wrap: wrap;
	}

	.tag-list li {
		position: relative;
		padding: 0.15rem 0.75rem 0.15rem 0;
		font-size: 0.7rem;
		letter-spacing: 0.15em;
		color: var(--text-muted);
	}

	.tag-list li:not(:last-child) {
		margin-right: 0.45rem;
	}

	.tag-list li:not(:last-child)::after {
		content: '';
		position: absolute;
		top: 50%;
		right: 0;
		transform: translateY(-50%);
		width: 1px;
		height: 0.8rem;
		background: color-mix(in srgb, var(--border-muted) 65%, transparent);
	}

	.post-body :global(h2),
	.post-body :global(h3),
	.post-body :global(h4),
	.post-body :global(h5),
	.post-body :global(h6) {
		margin: 2.2rem 0 0.9rem;
		color: var(--text-strong);
		line-height: 1.25;
		font-weight: 600;
		scroll-margin-top: 5.5rem;
	}

	.post-body :global(h2) {
		font-size: clamp(1.8rem, 1.4rem + 1.2vw, 2.45rem);
		letter-spacing: -0.01em;
		padding-top: 1rem;
		border-top: 1px solid color-mix(in srgb, var(--border-subtle) 85%, transparent);
	}

	.post-body :global(h3) {
		font-size: clamp(1.35rem, 1rem + 0.9vw, 1.9rem);
		letter-spacing: -0.005em;
		color: color-mix(in srgb, var(--text-strong) 90%, var(--text-base));
	}

	.post-body :global(h4) {
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin-top: 2rem;
	}

	.post-body :global(h5),
	.post-body :global(h6) {
		font-size: 0.92rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--text-muted);
		margin-top: 1.75rem;
	}

	.post-body :global(p),
	.post-body :global(li) {
		line-height: 1.7;
		color: var(--text-base);
	}

	.post-body :global(ul),
	.post-body :global(ol) {
		margin: 1rem 0 1.5rem 1.3rem;
		padding-left: 0;
	}

	.post-body :global(ul li) {
		list-style: none;
		position: relative;
		padding-left: 0.9rem;
		margin-bottom: 0.45rem;
	}

	.post-body :global(ul li)::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.7em;
		width: 0.3rem;
		height: 0.3rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-strong) 55%, transparent);
	}

	.post-body :global(ol li) {
		padding-left: 0.4rem;
		margin-bottom: 0.45rem;
	}

	.post-body :global(ol li::marker) {
		font-weight: 600;
		color: color-mix(in srgb, var(--text-strong) 90%, var(--text-base));
	}

	.post-body :global(a) {
		color: var(--text-strong);
		font-weight: 600;
		text-decoration: none;
		border-bottom: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.post-body :global(a:hover),
	.post-body :global(a:focus-visible) {
		color: color-mix(in srgb, var(--text-strong) 90%, var(--code-accent));
		border-bottom-color: currentColor;
	}

	.post-body-wrapper {
		position: relative;
		min-height: 12rem;
	}

	.post-body[data-ready='false'] {
		opacity: 0;
		pointer-events: none;
		user-select: none;
	}

	.post-body-placeholder {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.25rem 0;
	}

	.skeleton-line,
	.skeleton-block {
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--bg-card) 70%, var(--bg-page)),
			color-mix(in srgb, var(--bg-card) 55%, var(--text-muted) 10%),
			color-mix(in srgb, var(--bg-card) 70%, var(--bg-page))
		);
		background-size: 200% 100%;
		border-radius: 0.4rem;
		height: 0.9rem;
		animation: skeletonPulse 1.6s ease-in-out infinite;
	}

	.skeleton-line.wide {
		width: 90%;
	}

	.skeleton-line.medium {
		width: 70%;
	}

	.skeleton-line:not(.wide):not(.medium) {
		width: 55%;
	}

	.skeleton-block.title {
		height: 2.2rem;
		width: 80%;
		margin-bottom: 0.5rem;
	}

	.skeleton-block.code {
		height: 6rem;
		border-radius: 0.75rem;
		margin: 0.5rem 0 0.75rem;
	}

	@keyframes skeletonPulse {
		0% {
			background-position: 100% 0;
			opacity: 0.65;
		}
		50% {
			background-position: 0 0;
			opacity: 0.85;
		}
		100% {
			background-position: -100% 0;
			opacity: 0.65;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-line,
		.skeleton-block {
			animation: none;
		}
	}

	.post-body :global(pre) {
		margin: 1.5rem 0;
		background: var(--code-bg);
		border: 1px solid var(--code-border);
		border-radius: 0.85rem;
		padding: 1.1rem 1.25rem 1.1rem 1.1rem;
		font-size: 0.92rem;
		line-height: 1.6;
		font-family:
			'JetBrains Mono', 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono',
			monospace;
		position: relative;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		overflow: visible;
		padding-right: 3.25rem;
	}

	.post-body :global(.math-block) {
		margin: 1.75rem 0;
		background: var(--code-bg);
		border: 1px solid var(--code-border);
		border-radius: 0.85rem;
		padding: 1.1rem 1.25rem 1.1rem 1.1rem;
		padding-right: 3.25rem;
		position: relative;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		overflow: visible;
		text-align: center;
	}

	.post-body :global(.math-block .math-block-content) {
		width: 100%;
		max-width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		text-align: center;
		padding: 0.15rem 0;
	}

	.post-body :global(.math-block .math-block-content mjx-container[display='true']) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		padding: 0.25rem;
		max-width: 100%;
		box-sizing: border-box;
	}

	.post-body :global(mjx-labels) {
		min-width: max-content;
		min-width: fit-content;
		width: auto;
		display: inline-flex;
		justify-content: flex-end;
		pointer-events: none;
	}

	.post-body :global(mjx-mtable[side='right'] mjx-labels) {
		left: auto;
		right: 0;
	}

	.post-body :global(mjx-mtable[side='left'] mjx-labels) {
		right: auto;
		left: 0;
	}

	.post-body :global(mjx-mtable[side='right']) {
		max-width: 100%;
	}

	.post-body :global(pre code) {
		display: block;
		color: var(--code-text);
		width: 100%;
		min-width: 100%;
		box-sizing: border-box;
		overflow-x: auto;
		padding-right: 1rem;
	}

	.post-body :global(pre .copy-button),
	.post-body :global(.math-block .copy-button) {
		position: absolute;
		top: 0.65rem;
		right: 0.65rem;
		border: 1px solid var(--code-border);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--bg-card) 90%, transparent);
		color: var(--code-text);
		width: 2.25rem;
		height: 2.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	.post-body :global(pre .copy-button:hover),
	.post-body :global(pre .copy-button:focus-visible),
	.post-body :global(.math-block .copy-button:hover),
	.post-body :global(.math-block .copy-button:focus-visible) {
		border-color: color-mix(in srgb, var(--code-text) 45%, transparent);
		background: color-mix(in srgb, var(--code-bg) 80%, transparent);
	}

	.post-body :global(pre .copy-button.copied),
	.post-body :global(.math-block .copy-button.copied) {
		background: var(--code-accent);
		color: #fff;
	}

	.post-body :global(pre .copy-button svg),
	.post-body :global(.math-block .copy-button svg) {
		width: 1.1rem;
		height: 1.1rem;
	}

	@media (max-width: 640px) {
		.post-main {
			padding: 1.25rem;
		}

		.post-shell {
			padding-inline: 0;
		}

		.post-article {
			padding: 1.25rem;
		}

		.toc-panel {
			padding: 0.75rem;
		}

		.post-body :global(pre),
		.post-body :global(.math-block) {
			padding: 0.9rem 0.9rem 0.9rem 0.85rem;
			padding-right: 2.75rem;
			font-size: 0.85rem;
		}

		.post-body :global(.math-block .math-block-content) {
			padding: 0.1rem 0;
		}
	}

	.post-body :global(.sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.post-body :global(.hljs) {
		color: var(--code-text);
		background: transparent;
	}

	.post-body :global(.hljs-keyword),
	.post-body :global(.hljs-selector-tag),
	.post-body :global(.hljs-literal),
	.post-body :global(.hljs-title),
	.post-body :global(.hljs-section) {
		color: var(--code-accent);
	}

	.post-body :global(.hljs-string),
	.post-body :global(.hljs-attribute),
	.post-body :global(.hljs-template-tag),
	.post-body :global(.hljs-template-variable) {
		color: var(--code-string);
	}

	.post-body :global(.hljs-number),
	.post-body :global(.hljs-symbol),
	.post-body :global(.hljs-bullet) {
		color: var(--code-number);
	}

	.post-body :global(.hljs-comment),
	.post-body :global(.hljs-quote) {
		color: var(--code-comment);
		font-style: italic;
	}

	.post-body :global(mjx-container) {
		display: inline-flex;
		align-items: center;
		margin: 0 0.15em;
		color: var(--text-strong);
	}

	.post-body :global(mjx-container[display='true']) {
		display: inline-flex;
		margin: 0;
	}

	.post-body :global(mjx-container),
	.post-body :global(mjx-container *) {
		font-family: var(--font-math, 'EulerVM', 'Times New Roman', serif);
		font-variant-ligatures: common-ligatures;
	}

	.post-body :global(mjx-container .mjx-monospace) {
		font-family: 'Inconsolata', 'JetBrains Mono', 'SFMono-Regular', ui-monospace, Menlo, Monaco,
			Consolas, 'Liberation Mono', monospace;
	}

	.post-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.75rem 0;
		font-size: 0.95rem;
		background: color-mix(in srgb, var(--bg-card) 85%, transparent);
		border-radius: 0.65rem;
		overflow: hidden;
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--border-subtle) 65%, transparent);
	}

	.post-body :global(table thead th) {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-strong);
		background: color-mix(in srgb, var(--text-strong) 6%, transparent);
		padding: 0.85rem 0.9rem;
		text-align: left;
	}

	.post-body :global(table tbody td) {
		padding: 0.85rem 0.9rem;
		color: var(--text-base);
	}

	.post-body :global(table tbody tr + tr td) {
		border-top: 1px solid color-mix(in srgb, var(--border-subtle) 75%, transparent);
	}

	.post-body :global(table tbody tr:hover td) {
		background: color-mix(in srgb, var(--bg-page) 65%, transparent);
	}

	.post-body :global(hr) {
		border: none;
		margin: 2rem 0;
		height: 1px;
		background: color-mix(in srgb, var(--border-muted) 65%, var(--bg-card));
	}
</style>
