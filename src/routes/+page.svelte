<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import type { PageData } from './$types';

	type SocialLink = {
		label: string;
		href: string;
		isExternal?: boolean;
	};

	const socials: SocialLink[] = [
		{
			label: 'GitHub',
			href: 'https://github.com/kai-erik-niermann',
			isExternal: true
		},
		{
			label: 'LinkedIn',
			href: 'https://www.linkedin.com/in/kai-erik-niermann/',
			isExternal: true
		},
		{
			label: 'Discord',
			href: 'https://discord.com/users/kai-erik-niermann',
			isExternal: true
		},
		{
			label: 'Email',
			href: 'mailto:kai.erik.niermann@example.com'
		}
	];

	const { data } = $props<{ data: PageData }>();
	const { projects, experiences } = data;

	const githubIcon = `
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56v-1.96c-3.22.7-3.9-1.56-3.9-1.56-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.05 1.8 2.75 1.28 3.42.98.11-.77.41-1.28.75-1.57-2.57-.29-5.28-1.31-5.28-5.84 0-1.29.47-2.33 1.23-3.15-.12-.3-.53-1.52.12-3.18 0 0 .99-.32 3.25 1.2a11.16 11.16 0 0 1 5.92 0c2.27-1.52 3.25-1.2 3.25-1.2.65 1.66.24 2.88.12 3.18.76.82 1.22 1.86 1.22 3.15 0 4.54-2.72 5.54-5.31 5.83.42.36.8 1.07.8 2.16v3.2c0 .31.2.68.8.56A11.5 11.5 0 0 0 12 .5Z"
			></path>
		</svg>
	`;

	const briefcaseIcon = `
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<path
				d="M19 6h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2ZM10 5h4v1h-4Zm9 5h-4v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1H5v8h14Z"
			></path>
		</svg>
	`;
</script>

<div
	class="grid min-h-screen grid-rows-[auto_1fr_auto]"
	style="background-color: var(--bg-page); color: var(--text-base);"
>
	<!-- Header -->
	<AppHeader />
	<!-- Grid Columns -->
	<div class="grid grid-cols-1 md:grid-cols-[200px_1fr]">
		<!-- Left Sidebar. -->
		<aside
			class="border-b p-4 md:border-r md:border-b-0"
			style="background-color: var(--bg-sidebar); border-color: var(--border-subtle); color: var(--text-strong);"
		>
			<div class="flex h-full flex-col gap-5 md:justify-start">
				<ul
					class="sidebar-socials flex flex-wrap justify-start gap-3 text-center text-sm font-medium md:flex-col md:flex-nowrap md:items-start md:text-left"
					aria-label="Social links"
				>
					{#each socials as social}
						<li>
							<a
								href={social.href}
								target={social.isExternal ? '_blank' : undefined}
								rel={social.isExternal ? 'noreferrer' : undefined}
								class="sidebar-social-link"
							>
								{social.label}
							</a>
						</li>
					{/each}
				</ul>
				<div class="sidebar-divider" role="separator" aria-hidden="true"></div>
				<a class="blog-link self-center" href="https://kaierikniermann.github.io/notes/001a/index.xml">Blog posts</a>
			</div>
		</aside>
		<!-- Main Content -->
		<main class="dashboard-main" style="background-color: var(--bg-main);">
			<div class="cards-grid">
				<section class="cards-column" aria-labelledby="projects-heading">
					<header class="column-header">
						<h2 id="projects-heading">Projects</h2>
					</header>
					{#if projects.length === 0}
						<p class="empty-state">Project notes are on their way.</p>
					{:else}
						<ul class="card-list">
							{#each projects as project}
								<li class="card">
									<div class="card-icon" aria-hidden="true">{@html githubIcon}</div>
									<div class="card-body">
										<div class="card-title-row">
											{#if project.link}
												<a
													href={project.link}
													target="_blank"
													rel="noreferrer"
													class="card-title link"
												>
													{project.title}
												</a>
											{:else}
												<span class="card-title">{project.title}</span>
											{/if}
										</div>
										<p class="card-description">{project.description}</p>
										{#if project.tags?.length}
											<ul class="tag-list compact">
												{#each project.tags as tag}
													<li>{tag}</li>
												{/each}
											</ul>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
				<section class="cards-column" aria-labelledby="experience-heading">
					<header class="column-header">
						<h2 id="experience-heading">Experience</h2>
					</header>
					{#if experiences.length === 0}
						<p class="empty-state">Experience records are still being written.</p>
					{:else}
						<ul class="card-list">
							{#each experiences as experience}
								<li class="card">
									<div class="card-icon" aria-hidden="true">{@html briefcaseIcon}</div>
									<div class="card-body">
										<div class="card-title-row">
											<span class="card-title">{experience.title}</span>
											{#if experience.period}
												<span class="card-period">{experience.period}</span>
											{/if}
										</div>
										{#if experience.role}
											<p class="card-role">{experience.role}</p>
										{/if}
										<p class="card-description">{experience.description}</p>
										{#if experience.tags?.length}
											<ul class="tag-list compact">
												{#each experience.tags as tag}
													<li>{tag}</li>
												{/each}
											</ul>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
		</main>
	</div>
	<!-- Footer -->
	<footer
		class="border-t p-4 text-center"
		style="background-color: var(--bg-footer); border-color: var(--border-subtle); color: var(--text-muted);"
	>
		Kai Erik Niermann | {new Date().getFullYear()}
	</footer>
</div>

<style>
	.dashboard-main {
		padding: clamp(1.5rem, 2vw, 3rem);
	}

	.cards-grid {
		display: grid;
		gap: clamp(1.5rem, 2vw, 2.5rem);
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.cards-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.cards-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.column-header h2 {
		margin: 0;
		font-size: 1rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.card-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card {
		display: flex;
		gap: 1rem;
		padding: 1.25rem;
		border-radius: 0.5rem;
		background: var(--bg-card);
		box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
		transition:
			border-color 150ms ease,
			transform 150ms ease;
	}

	.card:hover,
	.card:focus-within {
		border-color: color-mix(in srgb, var(--text-strong) 45%, transparent);
		transform: translateY(-2px);
	}

	.card-icon {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--bg-main) 50%, transparent);
		display: grid;
		place-items: center;
		color: var(--text-strong);
	}

	.card-icon :global(svg) {
		width: 1.4rem;
		height: 1.4rem;
		fill: currentColor;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card-title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
	}

	.card-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-strong);
	}

	.card-title.link {
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 120ms ease;
	}

	.card-title.link:hover,
	.card-title.link:focus-visible {
		border-color: currentColor;
	}

	.card-period {
		font-size: 0.85rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.card-role {
		margin: 0;
		font-size: 0.95rem;
		color: var(--text-base);
	}

	.card-description {
		margin: 0;
		line-height: 1.6;
		color: var(--text-base);
	}

	.sidebar-socials {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.sidebar-social-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.75rem;
		border-radius: 0.4rem;
		border: 1px solid var(--border-muted);
		color: var(--text-strong);
		text-decoration: none;
		transition:
			color 150ms ease,
			border-color 150ms ease,
			background-color 150ms ease;
	}

	.sidebar-social-link:hover,
	.sidebar-social-link:focus-visible {
		border-color: color-mix(in srgb, var(--text-strong) 45%, transparent);
		background-color: color-mix(in srgb, var(--text-strong) 6%, transparent);
		color: var(--text-base);
	}

	.sidebar-divider {
		height: 1px;
		width: 100%;
		background: linear-gradient(
			to right,
			transparent,
			color-mix(in srgb, var(--text-strong) 25%, transparent),
			transparent
		);
		opacity: 0.6;
	}

	.blog-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 1.1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border-muted);
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text-strong);
		text-decoration: none;
		background-color: transparent;
		transition:
			border-color 150ms ease,
			background-color 150ms ease,
			color 150ms ease;
	}

	.blog-link:hover,
	.blog-link:focus-visible {
		border-color: color-mix(in srgb, var(--text-strong) 45%, transparent);
		background-color: color-mix(in srgb, var(--text-strong) 4%, transparent);
		color: var(--text-base);
	}

	.tag-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.tag-list.compact li {
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.45rem;
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		background: color-mix(in srgb, var(--bg-main) 65%, transparent);
		border-radius: 0.4rem;
	}
</style>
