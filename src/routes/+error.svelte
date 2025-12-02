<main class="error-page">
	<p class="message">Something went wrong.</p>
	<p class="hint">It&#39;s okay, just head back home.</p>
	<a class="home-link" href="/">Return to the homepage</a>
</main>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		text-align: center;
	}

	.home-link {
		color: inherit;
		text-decoration: underline;
		font-weight: 600;
	}
</style>
