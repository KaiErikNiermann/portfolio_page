// Central place for defining MathJax macros used across blog posts.
// Add or adjust entries in this object to create custom commands.
// Example: { RR: '\\mathbb{R}', bold: ['{\\bf #1}', 1] }
export const mathjaxMacros: Record<string, string | [string, number]> = {
	RR: '\\mathbb{R}',
	NN: '\\mathbb{N}',
	ZZ: '\\mathbb{Z}'
};
