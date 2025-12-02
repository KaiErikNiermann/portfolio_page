import { describe, expect, it } from 'vitest';
import { normalizeAlignEnvironmentTags } from './align-tags';

describe('normalizeAlignEnvironmentTags', () => {
	it('converts bracketed aligned blocks with tags into align environments', () => {
		const source = String.raw`\[\begin{aligned}
			a &= b \tag{1}\\
			c &= d
		\end{aligned}\]`;
		const result = normalizeAlignEnvironmentTags(source);
		expect(result).toContain(String.raw`\begin{align}`);
		expect(result).toContain(String.raw`\tag{1}`);
		expect(result).not.toContain(String.raw`\begin{aligned}`);
		expect(result).not.toMatch(/\\\[|\\\]/);
	});

	it('converts align* blocks with tags into align environments', () => {
		const source = String.raw`\begin{align*}
			a &= b \tag{*}
		\end{align*}`;
		const result = normalizeAlignEnvironmentTags(source);
		expect(result).toBe(String.raw`\begin{align}
a &= b \tag{*}
\end{align}`);
	});

	it('leaves aligned blocks without tags untouched', () => {
		const source = String.raw`\[\begin{aligned}
			a &= b \\
			c &= d
		\end{aligned}\]`;
		const result = normalizeAlignEnvironmentTags(source);
		expect(result).toBe(source);
	});

	it('converts double-dollar aligned blocks containing tags', () => {
		const source = String.raw`$$\begin{aligned}
			x &= y \tag{foo}
		\end{aligned}$$`;
		const result = normalizeAlignEnvironmentTags(source);
		expect(result).toBe(String.raw`\begin{align}
x &= y \tag{foo}
\end{align}`);
	});

	it('fixes escaped aligned endings even when no tags are present', () => {
		const source = String.raw`\[\begin{aligned}
			a &= b \\
			c &= d \\
\\end{aligned}\]`;
		const result = normalizeAlignEnvironmentTags(source);
		const expected = source.replace(String.raw`\\end{aligned}`, String.raw`\end{aligned}`);
		expect(result).toBe(expected);
		expect(result).not.toContain(String.raw`\\end{aligned}`);
	});

	it('preserves newline markers right before \end{aligned}', () => {
		const source = String.raw`\[\begin{aligned}
			a &= b \\
			\ldots \\\end{aligned}\]`;
		const result = normalizeAlignEnvironmentTags(source);
		expect(result).toBe(source);
	});
});
