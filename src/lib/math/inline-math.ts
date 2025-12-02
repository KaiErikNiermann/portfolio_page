const BOUNDARY_WHITESPACE = /[ \t]/;

function isEscaped(text: string, index: number): boolean {
	let backslashCount = 0;
	let cursor = index - 1;
	while (cursor >= 0 && text[cursor] === '\\') {
		backslashCount += 1;
		cursor -= 1;
	}
	return backslashCount % 2 === 1;
}

function isInlineDollarStart(text: string, index: number): boolean {
	return (
		text[index] === '$' &&
		text[index + 1] !== '$' &&
		text[index - 1] !== '$' &&
		!isEscaped(text, index)
	);
}

function isInlineDollarEnd(text: string, index: number): boolean {
	return (
		text[index] === '$' &&
		text[index + 1] !== '$' &&
		text[index - 1] !== '$' &&
		!isEscaped(text, index)
	);
}

function isParenStart(text: string, index: number): boolean {
	return text[index] === '\\' && text[index + 1] === '(' && !isEscaped(text, index);
}

function isParenEnd(text: string, index: number): boolean {
	return text[index] === '\\' && text[index + 1] === ')' && !isEscaped(text, index);
}

function skipLeadingBoundaryWhitespace(text: string, index: number): number {
	let cursor = index;
	let consumedNewline = false;

	while (cursor < text.length) {
		const char = text[cursor];
		if (char === '\n') {
			consumedNewline = true;
			cursor += 1;
			continue;
		}

		if (char === '\r') {
			consumedNewline = true;
			cursor += 1;
			if (cursor < text.length && text[cursor] === '\n') {
				cursor += 1;
			}
			continue;
		}

		if (consumedNewline && BOUNDARY_WHITESPACE.test(char)) {
			cursor += 1;
			continue;
		}

		break;
	}

	return cursor;
}

function trimTrailingBoundaryWhitespace(value: string): string {
	let end = value.length;
	let removedAny = false;

	while (end > 0) {
		let cursor = end;
		let removedThisRound = false;

		if (cursor > 0 && value[cursor - 1] === '\n') {
			removedThisRound = true;
			cursor -= 1;
			if (cursor > 0 && value[cursor - 1] === '\r') {
				cursor -= 1;
			}
		} else if (cursor > 0 && value[cursor - 1] === '\r') {
			removedThisRound = true;
			cursor -= 1;
		}

		if (!removedThisRound) {
			break;
		}

		removedAny = true;
		while (cursor > 0 && BOUNDARY_WHITESPACE.test(value[cursor - 1])) {
			cursor -= 1;
		}

		end = cursor;
	}

	return removedAny ? value.slice(0, end) : value;
}

export function cleanInlineMathBoundaries(input: string): string {
	if (!input.includes('$') && !input.includes('\\')) {
		return input;
	}

	let result = '';
	let cursor = 0;
	type State = 'none' | 'dollar' | 'paren';
	let state: State = 'none';

	while (cursor < input.length) {
		if (state === 'none') {
			if (isInlineDollarStart(input, cursor)) {
				result += '$';
				cursor = skipLeadingBoundaryWhitespace(input, cursor + 1);
				state = 'dollar';
				continue;
			}

			if (isParenStart(input, cursor)) {
				result += '\\(';
				cursor = skipLeadingBoundaryWhitespace(input, cursor + 2);
				state = 'paren';
				continue;
			}
		} else if (state === 'dollar' && isInlineDollarEnd(input, cursor)) {
			result = trimTrailingBoundaryWhitespace(result);
			result += '$';
			cursor += 1;
			state = 'none';
			continue;
		} else if (state === 'paren' && isParenEnd(input, cursor)) {
			result = trimTrailingBoundaryWhitespace(result);
			result += '\\)';
			cursor += 2;
			state = 'none';
			continue;
		}

		result += input[cursor];
		cursor += 1;
	}

	return result;
}
