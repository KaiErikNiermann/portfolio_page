import { describe, it, expect } from 'vitest';
import { cleanInlineMathBoundaries } from './inline-math';

const multiLine = (...lines: string[]) => lines.join('\n');

describe('cleanInlineMathBoundaries', () => {
	it('removes leading and trailing newlines for inline dollar math', () => {
		const input = multiLine('Energy is $', ' E = mc^2 ', '$ and mass matters.');
		const output = cleanInlineMathBoundaries(input);
		expect(output).toBe('Energy is $E = mc^2$ and mass matters.');
	});

	it('handles inline math delimited by \\( \\)', () => {
		const input = multiLine('We can write \\(', '  x + y', '\\) as a sum.');
		const output = cleanInlineMathBoundaries(input);
		expect(output).toBe('We can write \\(x + y\\) as a sum.');
	});

	it('leaves escaped dollar signs untouched', () => {
		const input = multiLine('The price is \\$20 even after trimming $', 'x', '$.');
		const output = cleanInlineMathBoundaries(input);
		expect(output).toBe('The price is \\$20 even after trimming $x$.');
	});

	it('ignores display math sections that use $$', () => {
		const input = multiLine('Equation: $$', ' x^2 + y^2 = z^2', '$$ end.');
		const output = cleanInlineMathBoundaries(input);
		expect(output).toBe(input);
	});
});
