<script lang="ts">
	import { onMount } from 'svelte';
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	type Theme = 'light' | 'dark';
	const storageKey = 'demo-theme';

	let theme: Theme = 'light';
	let mounted = false;
	let darkMode = false;

	const applyTheme = (value: Theme) => {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		root.classList.remove('theme-light', 'theme-dark');
		root.classList.add(`theme-${value}`);
		root.style.colorScheme = value;
	};

	onMount(() => {
		const saved = window.localStorage.getItem(storageKey) as Theme | null;
		if (saved === 'light' || saved === 'dark') {
			theme = saved;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}

		darkMode = theme === 'dark';
		applyTheme(theme);
		mounted = true;
	});

	$: if (mounted) {
		const next = darkMode ? 'dark' : 'light';
		if (next !== theme) {
			theme = next;
			applyTheme(theme);
			window.localStorage.setItem(storageKey, theme);
		}
	}
</script>

<header
	class="app-header"
	style="background-color: var(--bg-header); border-color: var(--border-subtle); color: var(--text-strong);"
>
	<a class="header-name" href="/" aria-label="Go to homepage">
		Kai Erik Niermann
	</a>
	<label class="flex flex-nowrap items-center gap-3 text-sm font-medium whitespace-nowrap">
		<Switch
			class="shrink-0"
			checked={darkMode}
			onCheckedChange={({ checked }) => (darkMode = checked)}
			aria-label="Toggle dark mode"
		>
			<Switch.Control>
				<Switch.Thumb>
					<Switch.Context>
						{#snippet children(switch_)}
							{#if switch_().checked}
								<SunIcon class="size-3" />
							{:else}
								<MoonIcon class="size-3" />
							{/if}
						{/snippet}
					</Switch.Context>
				</Switch.Thumb>
			</Switch.Control>
			<Switch.HiddenInput />
		</Switch>
	</label>
</header>

<style>
	.app-header {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
		padding: 1rem;
	}
    
	.header-name {
		text-decoration: none;
		color: inherit;
	}

	:global(:root.theme-light) .header-name {
        font-size: clamp(1.25rem, 1rem + 1vw, 1.65rem);
        font-weight: 600;
        letter-spacing: -0.01em;
        background: linear-gradient(270deg, #111318 25%, #0400ff 109.47%, #111318 109.48%);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
	}
    
	:global(:root.theme-dark) .header-name {
        font-size: clamp(1.25rem, 1rem + 1vw, 1.65rem);
        font-weight: 600;
        letter-spacing: -0.01em;
		background: linear-gradient(270deg, #ffffff 25%, #0400ff 109.47%, #ffffff 109.48%);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
	}
</style>
