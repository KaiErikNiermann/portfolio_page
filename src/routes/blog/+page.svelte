<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
	const { posts } = data;

	const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
	const formatDate = (value: string) => dateFormatter.format(new Date(value));
</script>

<div class="blog-layout" style="background-color: var(--bg-page); color: var(--text-base);">
	<AppHeader />
	<main class="blog-main" style="background-color: var(--bg-main);">
		<section class="posts-grid">
			{#if posts.length === 0}
				<p class="empty-state">No posts yet. Check back soon.</p>
			{:else}
				{#each posts as post}
					<article class="post-card">
						<div class="post-meta">
							<span>{formatDate(post.published)}</span>
							{#if post.tags.length}
								<ul class="tag-list">
									{#each post.tags as tag}
										<li>{tag}</li>
								{/each}
							</ul>
						{/if}
						</div>
						<h2>
							<a href={`/blog/${post.slug}`}>
								{post.title}
							</a>
						</h2>
						<p class="description">{post.description}</p>
						<div class="card-actions">
							<a class="text-link" href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
								Read post →
							</a>
						</div>
					</article>
				{/each}
			{/if}
		</section>
	</main>
</div>

<style>
	.blog-layout {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.blog-main {
		padding: clamp(1.5rem, 2vw, 3rem);
	}

	.posts-grid {
		display: grid;
		gap: 1.5rem;
	}

	.post-card {
		border-radius: 0.5rem;
		padding: 1.5rem;
		background: var(--bg-card);
		box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
		transition: transform 180ms ease, box-shadow 180ms ease;
	}

	.post-card:hover,
	.post-card:focus-within {
		transform: translateY(-2px);
		box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
	}

	.post-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.25em;
		color: var(--text-muted);
	}

	.tag-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: 0.45rem;
	}

	.tag-list li {
		position: relative;
		padding: 0.1rem 0.75rem 0.1rem 0;
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	.tag-list li:not(:last-child) {
		margin-right: 0.4rem;
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

	h2 {
		margin: 0.75rem 0 0.5rem;
		font-size: clamp(1.35rem, 1.1rem + 1vw, 1.85rem);
		color: var(--text-strong);
	}

	h2 a {
		text-decoration: none;
		color: inherit;
	}

	h2 a:hover,
	h2 a:focus-visible {
		text-decoration: underline;
		text-decoration-thickness: 2px;
	}

	.description {
		margin: 0 0 1.25rem;
		line-height: 1.6;
		color: var(--text-base);
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
	}

	.text-link {
		font-weight: 600;
		color: var(--text-strong);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 150ms ease;
	}

	.text-link:hover,
	.text-link:focus-visible {
		border-color: currentColor;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		border: 1px dashed var(--border-muted);
		border-radius: 1rem;
		color: var(--text-muted);
	}
</style>
